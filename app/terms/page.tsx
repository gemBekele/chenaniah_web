import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { FileText, Users, Shield, CreditCard, AlertCircle, Mail } from "lucide-react"

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6">
              <FileText className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-5xl font-bold text-foreground mb-4 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
              Terms of Service
            </h1>
            <p className="text-xl text-muted-foreground mb-2">
              Simple and clear terms for using our services
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
            
            {/* What We Offer */}
            <div className="bg-card border border-border rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-2xl font-semibold text-foreground">What We Offer</h2>
              </div>
              <div className="space-y-4 text-muted-foreground">
                <p>Chenaniah.org provides:</p>
                <ul className="space-y-2 ml-4">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                    Worship and music ministry training
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                    Educational resources and materials
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                    Events and workshops
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                    Online and offline programs
                  </li>
                </ul>
              </div>
            </div>

            {/* Your Responsibilities */}
            <div className="bg-card border border-border rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-2xl font-semibold text-foreground">Your Responsibilities</h2>
              </div>
              <div className="space-y-4 text-muted-foreground">
                <p>When using our services, you agree to:</p>
                <ul className="space-y-2 ml-4">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                    Provide accurate information
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                    Use our services for lawful purposes only
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                    Respect other users and our community
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                    Not share harmful or inappropriate content
                  </li>
                </ul>
              </div>
            </div>

            {/* Payment & Refunds */}
            <div className="bg-card border border-border rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <h2 className="text-2xl font-semibold text-foreground">Payment & Refunds</h2>
              </div>
              <div className="space-y-4 text-muted-foreground">
                <ul className="space-y-2 ml-4">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                    All payments are processed securely
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                    Refunds are available within 7 days of purchase
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                    Contact us for refund requests
                  </li>
                </ul>
              </div>
            </div>

            {/* Content & Copyright */}
            <div className="bg-card border border-border rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <h2 className="text-2xl font-semibold text-foreground">Content & Copyright</h2>
              </div>
              <div className="space-y-4 text-muted-foreground">
                <p>Our content is protected by copyright. You may not:</p>
                <ul className="space-y-2 ml-4">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                    Copy or redistribute our materials without permission
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                    Use our content for commercial purposes
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                    Modify or create derivative works
                  </li>
                </ul>
              </div>
            </div>

            {/* Important Notes */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 border border-amber-200 dark:border-amber-800 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/20 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <h2 className="text-2xl font-semibold text-foreground">Important Notes</h2>
              </div>
              <div className="space-y-4 text-muted-foreground">
                <ul className="space-y-2 ml-4">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
                    We may update these terms from time to time
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
                    Continued use means you accept any changes
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
                    We reserve the right to suspend accounts for violations
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
                    These terms are governed by Ethiopian law
                  </li>
                </ul>
              </div>
            </div>

            {/* Contact */}
            <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center">
                  <Mail className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h2 className="text-2xl font-semibold text-foreground">Questions?</h2>
              </div>
              <p className="text-muted-foreground mb-4">
                If you have any questions about these terms, please contact us:
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
