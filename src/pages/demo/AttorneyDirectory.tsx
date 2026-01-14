import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAttorneys } from '@/hooks/useAttorneys';
import { useDemoAuth } from '@/contexts/DemoAuthContext';
import { Search, Filter, User, Mail, Phone, MapPin, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function AttorneyDirectory() {
  const { data: attorneys, isLoading } = useAttorneys();
  const { user } = useDemoAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [practiceAreaFilter, setPracticeAreaFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedAttorney, setSelectedAttorney] = useState<typeof attorneys extends (infer T)[] | undefined ? T : never | null>(null);

  const practiceAreas = useMemo(() => {
    if (!attorneys) return [];
    const areas = new Set<string>();
    attorneys.forEach(a => a.practice_areas?.forEach(pa => areas.add(pa)));
    return Array.from(areas).sort();
  }, [attorneys]);

  const filteredAttorneys = useMemo(() => {
    if (!attorneys) return [];
    
    return attorneys.filter(attorney => {
      const matchesSearch = 
        attorney.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        attorney.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        attorney.firm_name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesPracticeArea = 
        practiceAreaFilter === 'all' || 
        (attorney.practice_areas as string[])?.includes(practiceAreaFilter);
      
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && attorney.is_active) ||
        (statusFilter === 'inactive' && !attorney.is_active) ||
        (statusFilter === 'available' && attorney.capacity_status === 'available') ||
        (statusFilter === 'at_capacity' && attorney.capacity_status === 'at_capacity');
      
      return matchesSearch && matchesPracticeArea && matchesStatus;
    });
  }, [attorneys, searchTerm, practiceAreaFilter, statusFilter]);

  const getStatusBadge = (attorney: NonNullable<typeof attorneys>[0]) => {
    if (!attorney.is_active) {
      return <Badge variant="secondary"><XCircle className="h-3 w-3 mr-1" />Inactive</Badge>;
    }
    if (attorney.capacity_status === 'at_capacity') {
      return <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />At Capacity</Badge>;
    }
    return <Badge className="bg-green-500"><CheckCircle2 className="h-3 w-3 mr-1" />Available</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Attorney Directory</h1>
          <p className="text-muted-foreground">
            {filteredAttorneys.length} attorneys {filteredAttorneys.length !== attorneys?.length && `(filtered from ${attorneys?.length})`}
          </p>
        </div>
        {user?.role === 'program_admin' && (
          <Button variant="outline" disabled>
            + Add Attorney (Demo)
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or firm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={practiceAreaFilter} onValueChange={setPracticeAreaFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Practice Area" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Practice Areas</SelectItem>
                {practiceAreas.map((area) => (
                  <SelectItem key={area} value={area}>
                    {area.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="at_capacity">At Capacity</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Attorney Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">
              Loading attorneys...
            </div>
          ) : filteredAttorneys.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Attorney</TableHead>
                    <TableHead>Practice Areas</TableHead>
                    <TableHead>Counties</TableHead>
                    <TableHead>Languages</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAttorneys.map((attorney) => (
                    <TableRow key={attorney.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{attorney.name}</p>
                          <p className="text-sm text-muted-foreground">{attorney.firm_name || 'Solo Practitioner'}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {attorney.practice_areas?.slice(0, 2).map((area) => (
                            <Badge key={area} variant="secondary" className="text-xs">
                              {area.replace(/_/g, ' ')}
                            </Badge>
                          ))}
                          {(attorney.practice_areas?.length || 0) > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{(attorney.practice_areas?.length || 0) - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {attorney.counties?.slice(0, 2).map((county) => (
                            <Badge key={county} variant="outline" className="text-xs">
                              {county}
                            </Badge>
                          ))}
                          {(attorney.counties?.length || 0) > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{(attorney.counties?.length || 0) - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {attorney.languages?.join(', ') || 'English'}
                        </span>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(attorney)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setSelectedAttorney(attorney)}
                            >
                              View
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>{attorney.name}</DialogTitle>
                              <DialogDescription>
                                {attorney.firm_name || 'Solo Practitioner'}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="flex items-center gap-2 text-sm">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <span>{attorney.email}</span>
                              </div>
                              {attorney.phone && (
                                <div className="flex items-center gap-2 text-sm">
                                  <Phone className="h-4 w-4 text-muted-foreground" />
                                  <span>{attorney.phone}</span>
                                </div>
                              )}
                              <div>
                                <p className="text-sm font-medium mb-2">Practice Areas</p>
                                <div className="flex flex-wrap gap-1">
                                  {attorney.practice_areas?.map((area) => (
                                    <Badge key={area} variant="secondary">
                                      {area.replace(/_/g, ' ')}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <p className="text-sm font-medium mb-2">Counties</p>
                                <div className="flex flex-wrap gap-1">
                                  {attorney.counties?.map((county) => (
                                    <Badge key={county} variant="outline">
                                      <MapPin className="h-3 w-3 mr-1" />
                                      {county}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <p className="text-sm font-medium mb-2">Languages</p>
                                <p className="text-sm text-muted-foreground">
                                  {attorney.languages?.join(', ') || 'English'}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm font-medium mb-2">Bar Number</p>
                                <p className="text-sm text-muted-foreground">{attorney.bar_number}</p>
                              </div>
                              <div className="pt-2">
                                {getStatusBadge(attorney)}
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No attorneys found matching your criteria</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
