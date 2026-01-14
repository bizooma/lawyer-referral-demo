import { useState } from 'react';
import { useAttorneyProfile } from '@/hooks/useAttorneyReferrals';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { User, Save, Building, Mail, Phone, Scale } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

const PRACTICE_AREAS = [
  { value: 'personal_injury', label: 'Personal Injury' },
  { value: 'family_law', label: 'Family Law' },
  { value: 'criminal_defense', label: 'Criminal Defense' },
  { value: 'estate_probate', label: 'Estate & Probate' },
  { value: 'immigration', label: 'Immigration' },
  { value: 'business', label: 'Business Law' },
];

const COUNTIES = [
  'Los Angeles', 'Orange', 'San Diego', 'Riverside', 'San Bernardino',
  'Santa Clara', 'Alameda', 'Sacramento', 'San Francisco', 'Contra Costa',
];

const LANGUAGES = ['English', 'Spanish', 'Mandarin', 'Vietnamese', 'Korean', 'Tagalog', 'Armenian'];

export default function AttorneyProfile() {
  const { data: profile, isLoading } = useAttorneyProfile();
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    phone: string;
    firmName: string;
    barNumber: string;
    bio: string;
    practiceAreas: string[];
    counties: string[];
    languages: string[];
  }>({
    name: profile?.attorney?.name || '',
    email: profile?.attorney?.email || '',
    phone: profile?.attorney?.phone || '',
    firmName: profile?.attorney?.firm_name || '',
    barNumber: profile?.attorney?.bar_number || '',
    bio: profile?.bio || '',
    practiceAreas: profile?.attorney?.practice_areas || [],
    counties: profile?.attorney?.counties || [],
    languages: profile?.attorney?.languages || ['English'],
  });

  // Update form when profile loads
  if (profile && !formData.name && profile.attorney?.name) {
    setFormData({
      name: profile.attorney.name,
      email: profile.attorney.email,
      phone: profile.attorney.phone || '',
      firmName: profile.attorney.firm_name || '',
      barNumber: profile.attorney.bar_number,
      bio: profile.bio || '',
      practiceAreas: profile.attorney.practice_areas || [],
      counties: profile.attorney.counties || [],
      languages: profile.attorney.languages || ['English'],
    });
  }

  const togglePracticeArea = (value: string) => {
    setFormData((prev) => {
      const updated = prev.practiceAreas.includes(value)
        ? prev.practiceAreas.filter((v) => v !== value)
        : [...prev.practiceAreas, value];
      return { ...prev, practiceAreas: updated };
    });
  };

  const toggleCounty = (value: string) => {
    setFormData((prev) => {
      const updated = prev.counties.includes(value)
        ? prev.counties.filter((v) => v !== value)
        : [...prev.counties, value];
      return { ...prev, counties: updated };
    });
  };

  const toggleLanguage = (value: string) => {
    setFormData((prev) => {
      const updated = prev.languages.includes(value)
        ? prev.languages.filter((v) => v !== value)
        : [...prev.languages, value];
      return { ...prev, languages: updated };
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast.success('Profile updated successfully (Demo)');
    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Profile</h1>
        <p className="text-muted-foreground">Manage your attorney profile and preferences</p>
      </div>

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center">
              <User className="h-8 w-8 text-emerald-600" />
            </div>
            <div>
              <CardTitle>{profile?.attorney?.name}</CardTitle>
              <CardDescription className="flex items-center gap-2">
                <Scale className="h-4 w-4" />
                Bar #{profile?.attorney?.bar_number}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="barNumber">Bar Number</Label>
              <Input
                id="barNumber"
                value={formData.barNumber}
                onChange={(e) => setFormData({ ...formData, barNumber: e.target.value })}
                disabled
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="firmName">Firm Name</Label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="firmName"
                value={formData.firmName}
                onChange={(e) => setFormData({ ...formData, firmName: e.target.value })}
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Tell clients about your experience and approach..."
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Practice Areas */}
      <Card>
        <CardHeader>
          <CardTitle>Practice Areas</CardTitle>
          <CardDescription>Select the areas of law you practice</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            {PRACTICE_AREAS.map((area) => (
              <div key={area.value} className="flex items-center space-x-2">
                <Checkbox
                  id={area.value}
                  checked={formData.practiceAreas.includes(area.value)}
                  onCheckedChange={() => togglePracticeArea(area.value)}
                />
                <label htmlFor={area.value} className="text-sm cursor-pointer">
                  {area.label}
                </label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Counties */}
      <Card>
        <CardHeader>
          <CardTitle>Counties Served</CardTitle>
          <CardDescription>Select the counties where you can accept clients</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3">
            {COUNTIES.map((county) => (
              <div key={county} className="flex items-center space-x-2">
                <Checkbox
                  id={county}
                  checked={formData.counties.includes(county)}
                  onCheckedChange={() => toggleCounty(county)}
                />
                <label htmlFor={county} className="text-sm cursor-pointer">
                  {county}
                </label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Languages */}
      <Card>
        <CardHeader>
          <CardTitle>Languages</CardTitle>
          <CardDescription>Select languages you can serve clients in</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {LANGUAGES.map((lang) => (
              <div key={lang} className="flex items-center space-x-2">
                <Checkbox
                  id={lang}
                  checked={formData.languages.includes(lang)}
                  onCheckedChange={() => toggleLanguage(lang)}
                />
                <label htmlFor={lang} className="text-sm cursor-pointer">
                  {lang}
                </label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving} size="lg">
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}
