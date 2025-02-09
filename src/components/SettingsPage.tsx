"use client"

import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Switch } from "./ui/switch"
import { Slider } from "./ui/slider"
import { Bell, Eye, Moon, MapPin, User, Shield, HelpCircle, ChevronRight } from "lucide-react"
import { useToast } from "./ui/use-toast"

export default function SettingsPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [pauseMode, setPauseMode] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [distance, setDistance] = useState(50)
  const [ageRange, setAgeRange] = useState([18, 35])
  const [travelMode, setTravelMode] = useState(false)

  const handleSaveChanges = () => {
    toast({
      title: "Settings saved",
      description: "Your preferences have been updated successfully.",
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-purple-50">
      <div className="max-w-4xl mx-auto p-4">
        <div className="flex flex-col items-center mb-8">
          <img src="/App-Logo.png" alt="Love Connect Logo" className="w-16 h-16 mb-2" />
        </div>
        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">
              Settings
            </CardTitle>
            <p className="text-gray-600">Manage your preferences and account settings</p>
          </CardHeader>

          <CardContent className="space-y-8">
            {/* Basic Settings */}
            <div className="space-y-6 rounded-2xl bg-pink-50/30 p-6">
              <h3 className="font-semibold text-lg text-gray-700">Basic Settings</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-pink-100 group-hover:bg-pink-200 transition-colors">
                      <Eye className="w-5 h-5 text-pink-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-700 group-hover:text-pink-600 transition-colors">
                        Pause Mode
                      </h3>
                      <p className="text-sm text-gray-500">Temporarily hide your profile</p>
                    </div>
                  </div>
                  <Switch 
                    checked={pauseMode} 
                    onCheckedChange={setPauseMode} 
                    className="data-[state=checked]:bg-pink-500"
                  />
                </div>

                <div className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-pink-100 group-hover:bg-pink-200 transition-colors">
                      <Moon className="w-5 h-5 text-pink-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-700 group-hover:text-pink-600 transition-colors">
                        Dark Mode
                      </h3>
                      <p className="text-sm text-gray-500">Switch to dark theme</p>
                    </div>
                  </div>
                  <Switch 
                    checked={darkMode} 
                    onCheckedChange={setDarkMode} 
                    className="data-[state=checked]:bg-pink-500"
                  />
                </div>
              </div>
            </div>

            {/* Discovery Settings */}
            <div className="space-y-6 rounded-2xl bg-pink-50/30 p-6">
              <h3 className="font-semibold text-lg text-gray-700">Discovery Settings</h3>
              
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-pink-100">
                      <MapPin className="w-5 h-5 text-pink-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-700">Maximum Distance</h3>
                      <p className="text-sm text-gray-500">{distance} kilometers</p>
                    </div>
                  </div>
                  <Slider
                    value={[distance]}
                    onValueChange={(value) => setDistance(value[0])}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-pink-100">
                      <User className="w-5 h-5 text-pink-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-700">Age Range</h3>
                      <p className="text-sm text-gray-500">{ageRange[0]} - {ageRange[1]} years</p>
                    </div>
                  </div>
                  <Slider
                    value={ageRange}
                    onValueChange={setAgeRange}
                    min={18}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>

                <div className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-pink-100 group-hover:bg-pink-200 transition-colors">
                      <MapPin className="w-5 h-5 text-pink-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-700 group-hover:text-pink-600 transition-colors">
                        Travel Mode
                      </h3>
                      <p className="text-sm text-gray-500">Show profiles from other locations</p>
                    </div>
                  </div>
                  <Switch 
                    checked={travelMode} 
                    onCheckedChange={setTravelMode} 
                    className="data-[state=checked]:bg-pink-500"
                  />
                </div>
              </div>
            </div>

            {/* Additional Settings */}
            <div className="grid gap-4">
              <Button
                variant="outline"
                className="w-full h-auto p-4 card-hover group justify-between"
                onClick={() => navigate("/settings/notifications")}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="p-2 rounded-full bg-pink-100 group-hover:bg-pink-200 transition-colors flex-shrink-0">
                    <Bell className="w-5 h-5 text-pink-600" />
                  </div>
                  <div className="text-left min-w-0">
                    <h3 className="font-semibold text-gray-700 group-hover:text-pink-600 transition-colors truncate">
                      Notifications
                    </h3>
                    <p className="text-sm text-gray-500 truncate">Manage your notification preferences</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-pink-600 transition-colors flex-shrink-0" />
              </Button>

              <Button
                variant="outline"
                className="w-full h-auto p-4 card-hover group justify-between"
                onClick={() => navigate("/settings/security")}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="p-2 rounded-full bg-pink-100 group-hover:bg-pink-200 transition-colors flex-shrink-0">
                    <Shield className="w-5 h-5 text-pink-600" />
                  </div>
                  <div className="text-left min-w-0">
                    <h3 className="font-semibold text-gray-700 group-hover:text-pink-600 transition-colors truncate">
                      Security & Privacy
                    </h3>
                    <p className="text-sm text-gray-500 truncate">Manage your account security</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-pink-600 transition-colors flex-shrink-0" />
              </Button>

              <Button
                variant="outline"
                className="w-full h-auto p-4 card-hover group justify-between"
                onClick={() => navigate("/settings/help")}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="p-2 rounded-full bg-pink-100 group-hover:bg-pink-200 transition-colors flex-shrink-0">
                    <HelpCircle className="w-5 h-5 text-pink-600" />
                  </div>
                  <div className="text-left min-w-0">
                    <h3 className="font-semibold text-gray-700 group-hover:text-pink-600 transition-colors truncate">
                      Help & Support
                    </h3>
                    <p className="text-sm text-gray-500 truncate">Get help and view FAQs</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-pink-600 transition-colors flex-shrink-0" />
              </Button>
            </div>

            <Button onClick={handleSaveChanges} className="w-full group">
              <div className="flex items-center justify-center gap-2">
                Save Changes
                <span className="group-hover:animate-bounce">💝</span>
              </div>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

