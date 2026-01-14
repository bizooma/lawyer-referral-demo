import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useIntakes } from '@/hooks/useIntakes';
import { useAttorneys } from '@/hooks/useAttorneys';
import { calculateMatchScores, MatchScore } from '@/hooks/useMatchingRules';
import { Scale, CheckCircle2, User, MapPin, Languages, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export default function Matching() {
  const { data: intakes, isLoading: intakesLoading } = useIntakes();
  const { data: attorneys, isLoading: attorneysLoading } = useAttorneys();
  const [selectedIntakeId, setSelectedIntakeId] = useState<string>('');
  const [matchResults, setMatchResults] = useState<MatchScore[]>([]);
  const [hasMatched, setHasMatched] = useState(false);

  const pendingIntakes = useMemo(() => 
    intakes?.filter(i => i.status === 'new' || i.status === 'matched') || [],
    [intakes]
  );

  const selectedIntake = useMemo(() => 
    intakes?.find(i => i.id === selectedIntakeId),
    [intakes, selectedIntakeId]
  );

  const runMatching = () => {
    if (!selectedIntake || !attorneys) return;

    const scores = calculateMatchScores(
      {
        area_of_law: selectedIntake.area_of_law,
        county: selectedIntake.county,
        language_preference: selectedIntake.language_preference,
      },
      attorneys
    );

    setMatchResults(scores);
    setHasMatched(true);
    toast.success('Matching Complete', {
      description: `Found ${scores.filter(s => s.score > 0).length} potential matches`,
    });
  };

  const handleReferral = (attorney: MatchScore['attorney']) => {
    toast.success('Referral Sent!', {
      description: `In a live system, ${attorney.name} would be notified about this referral.`,
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 50) return 'text-green-600 bg-green-50';
    if (score >= 25) return 'text-yellow-600 bg-yellow-50';
    if (score > 0) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Attorney Matching</h1>
        <p className="text-muted-foreground">
          Match intakes with available attorneys using the scoring algorithm.
        </p>
      </div>

      {/* Intake Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Intake</CardTitle>
          <CardDescription>Choose an intake to find matching attorneys</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={selectedIntakeId} onValueChange={(value) => {
            setSelectedIntakeId(value);
            setHasMatched(false);
            setMatchResults([]);
          }}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select an intake..." />
            </SelectTrigger>
            <SelectContent>
              {intakesLoading ? (
                <SelectItem value="loading" disabled>Loading...</SelectItem>
              ) : pendingIntakes.length > 0 ? (
                pendingIntakes.map((intake) => (
                  <SelectItem key={intake.id} value={intake.id}>
                    {intake.intake_number} - {intake.caller_name} ({intake.area_of_law.replace(/_/g, ' ')})
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="none" disabled>No pending intakes</SelectItem>
              )}
            </SelectContent>
          </Select>

          {selectedIntake && (
            <div className="p-4 bg-muted/50 rounded-lg space-y-2">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">
                  {selectedIntake.area_of_law.replace(/_/g, ' ')}
                </Badge>
                <Badge variant="outline">
                  <MapPin className="h-3 w-3 mr-1" />
                  {selectedIntake.county}
                </Badge>
                {selectedIntake.language_preference && (
                  <Badge variant="outline">
                    <Languages className="h-3 w-3 mr-1" />
                    {selectedIntake.language_preference}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {selectedIntake.narrative || 'No narrative provided'}
              </p>
            </div>
          )}

          <Button 
            onClick={runMatching} 
            disabled={!selectedIntakeId || attorneysLoading}
            className="w-full"
          >
            <Scale className="mr-2 h-4 w-4" />
            Run Matching Algorithm
          </Button>
        </CardContent>
      </Card>

      {/* Match Results */}
      {hasMatched && (
        <Card>
          <CardHeader>
            <CardTitle>Match Results</CardTitle>
            <CardDescription>
              Attorneys ranked by match score. Scoring: +40 practice area, +15 county, +10 language, -30 at capacity, -50 excluded.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {matchResults.length > 0 ? (
              <div className="space-y-3">
                {matchResults.slice(0, 10).map((result, index) => (
                  <div 
                    key={result.attorney.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`flex items-center justify-center w-12 h-12 rounded-full font-bold ${getScoreColor(result.score)}`}>
                        {result.score}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{result.attorney.name}</p>
                          {index === 0 && result.score > 0 && (
                            <Badge className="bg-green-500">Best Match</Badge>
                          )}
                          {result.attorney.capacity_status === 'at_capacity' && (
                            <Badge variant="destructive" className="text-xs">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              At Capacity
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {result.attorney.firm_name || 'Solo Practitioner'}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {result.attorney.practice_areas.slice(0, 3).map((area) => (
                            <Badge key={area} variant="secondary" className="text-xs">
                              {area.replace(/_/g, ' ')}
                            </Badge>
                          ))}
                        </div>
                        <div className="text-xs text-muted-foreground mt-2">
                          Score breakdown: Practice +{result.breakdown.practiceArea}, 
                          County +{result.breakdown.county}, 
                          Language +{result.breakdown.language}
                          {result.breakdown.capacity !== 0 && `, Capacity ${result.breakdown.capacity}`}
                          {result.breakdown.exclusion !== 0 && `, Exclusion ${result.breakdown.exclusion}`}
                        </div>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleReferral(result.attorney)}
                      disabled={result.score <= 0}
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Refer
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No matching attorneys found</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
