import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Textarea } from "./ui/textarea"
import { Label } from "./ui/label"
import { MessageCircle, HelpCircle, Mail, Phone, ArrowLeft } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion"
import { useNavigate } from "react-router-dom"

export default function ContactFAQ() {
  const faqs = [
    {
      question: "How does matching work?",
      answer: "Our matching algorithm considers your interests, preferences, and location to find compatible matches. The more information you provide, the better matches we can find for you."
    },
    {
      question: "Can I change my location?",
      answer: "Yes! You can enable Travel Mode in settings to see matches from different locations."
    },
    {
      question: "How do I reset my password?",
      answer: "Go to the Security & Privacy settings page to change your password. If you've forgotten your password, use the 'Forgot Password' option on the login screen."
    },
    // Add more FAQs as needed
  ]

  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-purple-50 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
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
              Frequently Asked Questions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-pink-100">
                        <HelpCircle className="w-4 h-4 text-pink-500" />
                      </div>
                      <span className="text-gray-700">{faq.question}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 pl-12">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">
              Contact Us
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4 p-4 bg-pink-50/50 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-pink-100">
                  <Mail className="w-5 h-5 text-pink-600" />
                </div>
                <p className="text-gray-700">support@loveconnect.com</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-pink-100">
                  <Phone className="w-5 h-5 text-pink-600" />
                </div>
                <p className="text-gray-700">1-800-LOVE (1-800-5683)</p>
              </div>
            </div>

            <div className="space-y-4">
              <Label htmlFor="message" className="text-gray-700 font-medium">
                Send us a message
              </Label>
              <Textarea
                id="message"
                placeholder="Type your message here..."
                className="input-cute min-h-[120px] resize-none"
              />
              <Button className="w-full group">
                <MessageCircle className="w-4 h-4 mr-2 group-hover:animate-bounce" />
                Send Message
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 