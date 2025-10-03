import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, Music, BookOpen } from "lucide-react"

export function AmharicSection() {
  const amharicValues = [
    {
      icon: BookOpen,
      title: "የመጽሐፍ ቅዱስ መሰረት",
      description: "ሁሉም ስልጠናችን በመጽሐፍ ቅዱስ የተመሰረተ ነው፣ የምስክርነት መሪዎች የአገልግሎታቸውን የኦርቶዶክስ መሰረት እንዲረዱ ያረጋግጣል።",
    },
    {
      icon: Heart,
      title: "የባህል ማዕቀፍ",
      description: "የኢትዮጵያን ባህል እናስከብራለን በመጽሐፍ ቅዱስ መርሆዎች ላይ በመመስረት፣ እውነተኛ የምስክርነት መግለጫዎችን እንፈጥራለን።",
    },
    {
      icon: Music,
      title: "በአገልግሎት ውስጥ ለላቀ",
      description: "ለተጸና የመንግስተ ሰማይ ተጽእኖ በሙዚቃዊ እና በመንፈሳዊ ስልጠና ውስጥ ከፍተኛ ደረጃዎችን እንፈልጋለን።",
    },
  ]

  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-[#E5C985] text-[#212E3E] hover:bg-[#E5C985]/90">የእኛ ተልእኮ</Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-[#212E3E] mb-6 text-balance">
            በመጽሐፍ ቅዱስ ስልጠና የምስክርነት ለውጥ
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto text-pretty leading-relaxed">
            ተልእኮችን በመጽሐፍ ቅዱስ የተመሰረተ ጠንካራ መሰረት፣ በሙዚቃ ውስጥ ለላቀ፣ እና በመንፈሳዊ ጥናት ውስጥ በኢትዮጵያ ውስጥ የምስክርነት መሪዎችን እናስተማራለን። 
            የምስክርነት መሪዎች በትክክል በተሰለጠኑ ጊዜ፣ ሙሉ ጉባኤዎች ይለወጣሉ፣ እና የእግዚአብሔር መንግስት በሀገራችን ውስጥ ይስፋፋል።
          </p>
        </div>

      
        {/* <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-[#212E3E] mb-4">የእኛ ዋና እሴቶች</h3>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            የምስክርነት መሪዎችን ለማስተማር ተልእኮችን የምንመራቸው መርሆዎች
          </p>
        </div> */}

       
      </div>
    </section>
  )
}

