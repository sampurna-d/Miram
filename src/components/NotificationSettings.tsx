import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Switch } from "./ui/switch"
import { Button } from "./ui/button"
import { Bell, MessageSquare, Heart, UserPlus, Mail, ArrowLeft } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useToast } from "./ui/use-toast"

export default function NotificationSettings() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [settings, setSettings] = useState({
    messages: true,
    matches: true,
    profileActivity: true,
    pushNotifications: true,
    emailNotifications: false
  })

  const handleSave = () => {
    toast({
      title: "Settings saved",
      description: "Your notification preferences have been updated.",
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-purple-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Button 
          variant="ghost" 
          className="mb-4 group"
          onClick={() => navigate("/settings")}
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:animate-bounce" />
          Back to Settings
        </Button>

        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">
              Notification Settings
            </CardTitle>
            <p className="text-gray-600">Customize how you want to be notified</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4 rounded-2xl bg-pink-50/30 p-4">
              <div className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-pink-100 group-hover:bg-pink-200 transition-colors">
                    <MessageSquare className="w-5 h-5 text-pink-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-700 group-hover:text-pink-600 transition-colors">New Messages</h3>
                    <p className="text-sm text-gray-500">Get notified when you receive new messages</p>
                  </div>
                </div>
                <Switch className="data-[state=checked]:bg-pink-500" />
              </div>

              <div className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-pink-100 group-hover:bg-pink-200 transition-colors">
                    <Heart className="w-5 h-5 text-pink-600 group-hover:animate-bounce" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-700 group-hover:text-pink-600 transition-colors">New Matches</h3>
                    <p className="text-sm text-gray-500">Get notified when you get a new match</p>
                  </div>
                </div>
                <Switch className="data-[state=checked]:bg-pink-500" />
              </div>

              <div className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-pink-100 group-hover:bg-pink-200 transition-colors">
                    <UserPlus className="w-5 h-5 text-pink-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-700 group-hover:text-pink-600 transition-colors">Profile Activity</h3>
                    <p className="text-sm text-gray-500">Get notified about profile views and likes</p>
                  </div>
                </div>
                <Switch className="data-[state=checked]:bg-pink-500" />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-pink-100 group-hover:bg-pink-200 transition-colors">
                    <Bell className="w-5 h-5 text-pink-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-700 group-hover:text-pink-600 transition-colors">Push Notifications</h3>
                    <p className="text-sm text-gray-500">Receive notifications on your device</p>
                  </div>
                </div>
                <Switch className="data-[state=checked]:bg-pink-500" />
              </div>

              <div className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-pink-100 group-hover:bg-pink-200 transition-colors">
                    <Mail className="w-5 h-5 text-pink-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-700 group-hover:text-pink-600 transition-colors">Email Notifications</h3>
                    <p className="text-sm text-gray-500">Receive notifications via email</p>
                  </div>
                </div>
                <Switch className="data-[state=checked]:bg-pink-500" />
              </div>
            </div>

            <Button onClick={handleSave} className="w-full group">
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