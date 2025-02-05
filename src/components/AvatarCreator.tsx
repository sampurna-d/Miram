import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

interface AvatarFeatures {
  topType: string;
  hairColor: string;
  facialHairType: string;
  accessoriesType: string;
  clotheType: string;
  clotheColor: string;
  eyeType: string;
  eyebrowType: string;
  mouthType: string;
  skinColor: string;
}

interface AvatarCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (avatarUrl: string) => void;
  currentAvatar?: string;
}

const AVATAR_OPTIONS = {
  topType: ['NoHair', 'Eyepatch', 'Hat', 'Hijab', 'LongHairBigHair', 'LongHairBob'],
  hairColor: ['Auburn', 'Black', 'Blonde', 'BlondeGolden', 'Brown', 'BrownDark'],
  facialHairType: ['Blank', 'BeardMedium', 'BeardLight', 'BeardMajestic', 'MoustacheFancy'],
  accessoriesType: ['Blank', 'Kurt', 'Prescription01', 'Prescription02', 'Round', 'Sunglasses'],
  clotheType: ['BlazerShirt', 'BlazerSweater', 'CollarSweater', 'GraphicShirt', 'Hoodie'],
  clotheColor: ['Black', 'Blue01', 'Blue02', 'Blue03', 'Gray01', 'Gray02', 'Heather'],
  eyeType: ['Close', 'Default', 'Happy', 'Side', 'Squint', 'Surprised', 'Wink'],
  eyebrowType: ['Default', 'DefaultNatural', 'FlatNatural', 'RaisedExcited', 'UnibrowNatural'],
  mouthType: ['Default', 'Eating', 'Grimace', 'Serious', 'Smile', 'Tongue', 'Twinkle'],
  skinColor: ['Light', 'DarkBrown', 'Brown', 'Yellow', 'Tanned', 'Pale']
};

export default function AvatarCreator({ isOpen, onClose, onSave, currentAvatar }: AvatarCreatorProps) {
  const [features, setFeatures] = useState<AvatarFeatures>({
    topType: 'NoHair',
    hairColor: 'Brown',
    facialHairType: 'Blank',
    accessoriesType: 'Blank',
    clotheType: 'BlazerShirt',
    clotheColor: 'Black',
    eyeType: 'Default',
    eyebrowType: 'Default',
    mouthType: 'Default',
    skinColor: 'Light'
  });

  const generateAvatarUrl = (config: AvatarFeatures) => {
    const params = new URLSearchParams({
      avatarStyle: 'Circle',
      ...config
    });
    return `https://avataaars.io/?${params.toString()}`;
  };

  const handleFeatureChange = (feature: keyof AvatarFeatures, value: string) => {
    setFeatures(prev => ({
      ...prev,
      [feature]: value
    }));
  };

  const handleSave = () => {
    const avatarUrl = generateAvatarUrl(features);
    onSave(avatarUrl);
    onClose();
  };

  useEffect(() => {
    if (currentAvatar) {
      try {
        const url = new URL(currentAvatar);
        const params = new URLSearchParams(url.search);
        const currentFeatures: Partial<AvatarFeatures> = {};
        
        params.forEach((value, key) => {
          if (key in features) {
            currentFeatures[key as keyof AvatarFeatures] = value;
          }
        });
        
        setFeatures(prev => ({
          ...prev,
          ...currentFeatures
        }));
      } catch (error) {
        console.error('Error parsing current avatar URL:', error);
      }
    }
  }, [currentAvatar]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[95vw] md:w-auto bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl md:text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">
            Create Your Avatar
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
          {/* Preview */}
          <div className="flex flex-col items-center justify-center p-4">
            <img 
              src={generateAvatarUrl(features)} 
              alt="Avatar preview"
              className="w-48 h-48 md:w-64 md:h-64"
            />
          </div>

          {/* Controls */}
          <div className="space-y-4 md:space-y-6">
            <Tabs defaultValue="face" className="w-full">
              <TabsList className="grid w-full grid-cols-3 gap-1 md:gap-2 rounded-xl p-1 bg-pink-50">
                <TabsTrigger 
                  value="face"
                  className="text-sm md:text-base rounded-lg data-[state=active]:bg-white data-[state=active]:text-pink-700 data-[state=active]:shadow-lg"
                >
                  Face
                </TabsTrigger>
                <TabsTrigger 
                  value="hair"
                  className="text-sm md:text-base rounded-lg data-[state=active]:bg-white data-[state=active]:text-pink-700 data-[state=active]:shadow-lg"
                >
                  Hair
                </TabsTrigger>
                <TabsTrigger 
                  value="clothes"
                  className="text-sm md:text-base rounded-lg data-[state=active]:bg-white data-[state=active]:text-pink-700 data-[state=active]:shadow-lg"
                >
                  Clothes
                </TabsTrigger>
              </TabsList>

              <TabsContent value="face" className="space-y-4">
                {/* Face features */}
                <FeatureSelect
                  label="Skin Color"
                  value={features.skinColor}
                  options={AVATAR_OPTIONS.skinColor}
                  onChange={(v) => handleFeatureChange('skinColor', v)}
                />
                <FeatureSelect
                  label="Eyes"
                  value={features.eyeType}
                  options={AVATAR_OPTIONS.eyeType}
                  onChange={(v) => handleFeatureChange('eyeType', v)}
                />
                <FeatureSelect
                  label="Eyebrows"
                  value={features.eyebrowType}
                  options={AVATAR_OPTIONS.eyebrowType}
                  onChange={(v) => handleFeatureChange('eyebrowType', v)}
                />
                <FeatureSelect
                  label="Mouth"
                  value={features.mouthType}
                  options={AVATAR_OPTIONS.mouthType}
                  onChange={(v) => handleFeatureChange('mouthType', v)}
                />
              </TabsContent>

              {/* Hair tab */}
              <TabsContent value="hair" className="space-y-4">
                <FeatureSelect
                  label="Hair Style"
                  value={features.topType}
                  options={AVATAR_OPTIONS.topType}
                  onChange={(v) => handleFeatureChange('topType', v)}
                />
                <FeatureSelect
                  label="Hair Color"
                  value={features.hairColor}
                  options={AVATAR_OPTIONS.hairColor}
                  onChange={(v) => handleFeatureChange('hairColor', v)}
                />
                <FeatureSelect
                  label="Facial Hair"
                  value={features.facialHairType}
                  options={AVATAR_OPTIONS.facialHairType}
                  onChange={(v) => handleFeatureChange('facialHairType', v)}
                />
                <FeatureSelect
                  label="Accessories"
                  value={features.accessoriesType}
                  options={AVATAR_OPTIONS.accessoriesType}
                  onChange={(v) => handleFeatureChange('accessoriesType', v)}
                />
              </TabsContent>

              {/* Clothes tab */}
              <TabsContent value="clothes" className="space-y-4">
                <FeatureSelect
                  label="Clothing Style"
                  value={features.clotheType}
                  options={AVATAR_OPTIONS.clotheType}
                  onChange={(v) => handleFeatureChange('clotheType', v)}
                />
                <FeatureSelect
                  label="Clothing Color"
                  value={features.clotheColor}
                  options={AVATAR_OPTIONS.clotheColor}
                  onChange={(v) => handleFeatureChange('clotheColor', v)}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose} className="text-sm md:text-base">Cancel</Button>
          <Button onClick={handleSave} className="text-sm md:text-base">Save Avatar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Helper component for feature selection
function FeatureSelect({ label, value, options, onChange }: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-pink-700">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full rounded-xl border-gray-200 focus:border-pink-500 focus:ring-pink-200 transition-shadow bg-white">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="rounded-xl border-gray-200 bg-white/95 backdrop-blur-sm shadow-lg">
          {options.map(option => (
            <SelectItem 
              key={option} 
              value={option}
              className="rounded-lg hover:bg-pink-50 focus:bg-pink-100 focus:text-pink-800 text-sm md:text-base"
            >
              {option.replace(/([A-Z])/g, ' $1').trim()}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
} 