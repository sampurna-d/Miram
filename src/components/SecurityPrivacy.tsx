import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Switch } from "./ui/switch"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Shield, Lock, Eye, Key, UserX, ArrowLeft } from "lucide-react"
import { useNavigate } from "react-router-dom"

export default function SecurityPrivacy() {
  const navigate = useNavigate()

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
              Security & Privacy
            </CardTitle>
            <p className="text-gray-600">Manage your account security and privacy settings</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Security Settings */}
            <div className="space-y-4 rounded-2xl bg-pink-50/30 p-4">
              <div className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-pink-100 group-hover:bg-pink-200 transition-colors">
                    <Shield className="w-5 h-5 text-pink-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-700 group-hover:text-pink-600 transition-colors">
                      Two-Factor Authentication
                    </h3>
                    <p className="text-sm text-gray-500">Add an extra layer of security</p>
                  </div>
                </div>
                <Switch className="data-[state=checked]:bg-pink-500" />
              </div>

              <div className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-pink-100 group-hover:bg-pink-200 transition-colors">
                    <Lock className="w-5 h-5 text-pink-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-700 group-hover:text-pink-600 transition-colors">
                      Private Account
                    </h3>
                    <p className="text-sm text-gray-500">Only show profile to matches</p>
                  </div>
                </div>
                <Switch className="data-[state=checked]:bg-pink-500" />
              </div>

              <div className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-pink-100 group-hover:bg-pink-200 transition-colors">
                    <Eye className="w-5 h-5 text-pink-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-700 group-hover:text-pink-600 transition-colors">
                      Online Status
                    </h3>
                    <p className="text-sm text-gray-500">Show when you're active</p>
                  </div>
                </div>
                <Switch className="data-[state=checked]:bg-pink-500" />
              </div>
            </div>

            {/* Password Change */}
            <div className="space-y-4 rounded-2xl bg-pink-50/30 p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-full bg-pink-100">
                  <Key className="w-5 h-5 text-pink-600" />
                </div>
                <h3 className="font-semibold text-gray-700">Change Password</h3>
              </div>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="current-password" className="text-gray-700">Current Password</Label>
                  <Input type="password" id="current-password" className="input-cute" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password" className="text-gray-700">New Password</Label>
                  <Input type="password" id="new-password" className="input-cute" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className="text-gray-700">Confirm New Password</Label>
                  <Input type="password" id="confirm-password" className="input-cute" />
                </div>
              </div>
            </div>

            {/* Blocked Users */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-pink-100">
                  <UserX className="w-5 h-5 text-pink-600" />
                </div>
                <h3 className="font-semibold text-gray-700">Blocked Users</h3>
              </div>
              <Button variant="outline" className="w-full group">
                <UserX className="w-4 h-4 mr-2 group-hover:text-pink-600" />
                Manage Blocked Users
              </Button>
            </div>

            <Button className="w-full group">
              <div className="flex items-center justify-center gap-2">
                Save Changes
                <span className="group-hover:animate-bounce">🔒</span>
              </div>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 