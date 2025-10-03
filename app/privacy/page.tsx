import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Shield, Eye, Lock, Mail } from "lucide-react"

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-5xl font-bold text-foreground mb-4 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
              Privacy Policy
            </h1>
            <p className="text-xl text-muted-foreground mb-2">
              Your privacy matters to us
            </p>
            <p className="text-sm text-muted-foreground/80">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="grid gap-8">
            
            {/* What We Collect */}
            <div className="bg-card border border-border rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                  <Eye className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-2xl font-semibold text-foreground">What We Collect</h2>
              </div>
              <div className="space-y-4 text-muted-foreground">
                <p>We collect information you provide directly to us, such as:</p>
                <ul className="space-y-2 ml-4">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                    Contact information (name, email, phone)
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                    Registration details for our programs
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                    Website usage data (pages visited, time spent)
                  </li>
                </ul>
              </div>
            </div>

            {/* How We Use It */}
            <div className="bg-card border border-border rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                  <Lock className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-2xl font-semibold text-foreground">How We Use Your Information</h2>
              </div>
              <div className="space-y-4 text-muted-foreground">
                <p>We use your information to:</p>
                <ul className="space-y-2 ml-4">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                    Provide and improve our services
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                    Send you updates about programs and events
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                    Respond to your inquiries
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                    Process payments securely
                  </li>
                </ul>
              </div>
            </div>

            {/* Data Protection */}
            <div className="bg-card border border-border rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <h2 className="text-2xl font-semibold text-foreground">Data Protection</h2>
              </div>
              <div className="space-y-4 text-muted-foreground">
                <p>We protect your information by:</p>
                <ul className="space-y-2 ml-4">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                    Using secure servers and encryption
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                    Never selling your personal information
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                    Limiting access to authorized personnel only
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                    Following industry best practices
                  </li>
                </ul>
              </div>
            </div>

            {/* Your Rights */}
            <div className="bg-gradient-to-r from-primary/5 to-transparent border border-primary/20 rounded-2xl p-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Your Rights</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>You have the right to:</p>
                <ul className="space-y-2 ml-4">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                    Access your personal information
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                    Correct inaccurate information
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                    Request deletion of your data
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                    Opt out of communications
                  </li>
                </ul>
              </div>
            </div>

            {/* Contact */}
            <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                  <Mail className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <h2 className="text-2xl font-semibold text-foreground">Questions?</h2>
              </div>
              <p className="text-muted-foreground mb-4">
                If you have any questions about this privacy policy, please contact us:
              </p>
              <div className="bg-muted/50 p-4 rounded-lg border border-border/50">
                <p className="text-foreground font-medium">
                  📧 chenaniahethiopia@gmail.com
                </p>
                <p className="text-foreground font-medium">
                  🌐 chenaniah.org
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
