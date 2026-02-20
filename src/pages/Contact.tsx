import { Helmet } from "react-helmet-async";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { faqSchema } from "@/lib/structuredData";
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock,
  Send,
  MessageCircle,
  HeadphonesIcon,
  Globe
} from "lucide-react";

const Contact = () => {
  const contactMethods = [
    {
      icon: Phone,
      title: "Phone Support",
      description: "Speak directly with our support team",
      contact: "+265 986 227 240",
      availability: "24/7 Emergency Support"
    },
    {
      icon: Mail,
      title: "Email Support",
      description: "Send us your questions or concerns",
      contact: "support@careconnectmalawi.com",
      availability: "Response within 2 hours"
    },
    {
      icon: MessageCircle,
      title: "WhatsApp",
      description: "Quick support via WhatsApp",
      contact: "+265 991 234 567",
      availability: "Mon-Fri, 8AM-6PM"
    },
    {
      icon: Globe,
      title: "Online Chat",
      description: "Live chat with our support team",
      contact: "Available on website",
      availability: "Mon-Sun, 6AM-10PM"
    }
  ];

  const offices = [
    {
      city: "Lilongwe",
      address: "Area 58, Lilongwe, Central Region, Malawi",
      phone: "+265 986 227 240",
      email: "support@careconnectmalawi.com"
    },
    {
      city: "Blantyre",
      address: "Limbe, Makata Road, Building 45",
      phone: "+265 986 227 240",
      email: "support@careconnectmalawi.com"
    },
    {
      city: "Mzuzu",
      address: "Mzimba Street, Near Central Hospital",
      phone: "+265 986 227 240",
      email: "support@careconnectmalawi.com"
    }
  ];

  const faqs = [
    {
      question: "How do I book an appointment?",
      answer: "Simply register on our platform, browse available caregivers, and book your preferred time slot. You'll receive instant confirmation."
    },
    {
      question: "Are all caregivers verified?",
      answer: "Yes, all our caregivers undergo thorough background checks, license verification, and skills assessment before joining our platform."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept mobile money (Airtel Money, TNM Mpamba), bank transfers, and credit/debit cards through our secure Paychangu integration."
    },
    {
      question: "Do you provide emergency services?",
      answer: "While we don't replace emergency services, we offer 24/7 support and can help coordinate urgent care needs with appropriate medical facilities."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Contact Us | CareConnect Malawi - 24/7 Support</title>
        <meta name="description" content="Contact CareConnect Malawi for home healthcare services. Call +265 986 227 240 or email support@careconnectmalawi.com. Offices in Lilongwe, Blantyre & Mzuzu." />
        <script type="application/ld+json">
          {JSON.stringify(faqSchema(faqs))}
        </script>
      </Helmet>
      <Header />
      <main>
        {/* Hero Section */}
        <section 
          className="py-8 lg:py-12 relative bg-cover bg-no-repeat rounded-b-3xl overflow-hidden"
          style={{ backgroundImage: 'url(/contact.png)', backgroundPosition: '0 45%' }}
        >
          <div className="absolute inset-0 bg-black/40"></div>
          <div className="container relative z-10">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold mb-4 text-white">
                Get in <span className="text-primary">Touch</span>
              </h1>
              <p className="text-lg text-white/90 mb-6">
                We're here to help! Whether you have questions about our services, 
                need technical support, or want to provide feedback, our team is ready to assist you.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Methods */}
        <section className="py-12 lg:py-16">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                Multiple Ways to Reach Us
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Choose the contact method that works best for you. We're committed to 
                providing quick and helpful responses.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {contactMethods.map((method, index) => (
                <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow">
                  <CardContent className="p-0">
                    <div className="h-16 w-16 rounded-2xl bg-gradient-primary flex items-center justify-center mx-auto mb-4">
                      <method.icon className="h-8 w-8 text-primary-foreground" />
                    </div>
                    <h3 className="font-display text-lg font-bold mb-2">
                      {method.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {method.description}
                    </p>
                    <div className="text-primary font-medium text-sm mb-2">
                      {method.contact}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {method.availability}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Form & Office Locations */}
        <section className="py-12 lg:py-16 bg-muted/30">
          <div className="container">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              {/* Contact Form */}
              <Card className="p-8">
                <CardHeader className="p-0 mb-6">
                  <CardTitle className="font-display text-2xl">Send us a Message</CardTitle>
                  <p className="text-muted-foreground">
                    Fill out the form below and we'll get back to you as soon as possible.
                  </p>
                </CardHeader>
                <CardContent className="p-0">
                  <form className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input id="firstName" placeholder="Your first name" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input id="lastName" placeholder="Your last name" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="your.email@example.com" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" placeholder="+265 991 234 567" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input id="subject" placeholder="How can we help you?" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea 
                        id="message" 
                        placeholder="Please describe your question or concern in detail..."
                        rows={5}
                      />
                    </div>
                    <Button className="w-full gap-2 bg-gradient-primary">
                      <Send className="h-4 w-4" />
                      Send Message
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Office Locations */}
              <div className="space-y-6">
                <div>
                  <h3 className="font-display text-2xl font-bold mb-4">Our Offices</h3>
                  <p className="text-muted-foreground mb-6">
                    Visit us at any of our locations across Malawi for in-person support and consultations.
                  </p>
                </div>
                {offices.map((office, index) => (
                  <Card key={index} className="p-6">
                    <CardContent className="p-0">
                      <div className="flex items-start gap-4">
                        <div className="h-12 w-12 rounded-xl bg-gradient-primary flex items-center justify-center flex-shrink-0">
                          <MapPin className="h-6 w-6 text-primary-foreground" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-display text-lg font-bold mb-2">{office.city}</h4>
                          <div className="space-y-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              <span>{office.address}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4" />
                              <span>{office.phone}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4" />
                              <span>{office.email}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-12 lg:py-16">
          <div className="container">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* FAQ Questions */}
              <div className="space-y-6">
                {faqs.map((faq, index) => (
                  <Card key={index} className="p-6">
                    <CardContent className="p-0">
                      <h3 className="font-display text-lg font-bold mb-3 text-primary">
                        {faq.question}
                      </h3>
                      <p className="text-muted-foreground">
                        {faq.answer}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {/* FAQ Header */}
              <div className="text-center">
                <div className="text-9xl text-blue-500/40 mb-4">?</div>
                <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                  Frequently Asked Questions
                </h2>
                <p className="text-xl text-muted-foreground">
                  Quick answers to common questions. Can't find what you're looking for? 
                  Contact us directly.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Emergency Contact */}
        <section className="py-12 lg:py-16 bg-muted/30">
          <div className="container">
            <Card className="p-8 lg:p-12 bg-white border border-slate-200 shadow-2xl rounded-lg">
              <CardContent className="p-0">
                <div className="grid lg:grid-cols-2 gap-8 items-center">
                  <div className="text-left">
                    <h2 className="font-display text-3xl md:text-4xl font-bold mb-4 text-gray-900">
                      Emergency Support
                    </h2>
                    <p className="text-lg text-gray-600 mb-6">
                      For urgent medical situations, call our 24/7 emergency hotline. 
                      Our team will help coordinate immediate care or direct you to appropriate emergency services.
                    </p>
                  </div>
                  <div className="text-center lg:text-right">
                    <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-end">
                      <Button size="lg" className="gap-2 bg-red-600 text-white hover:bg-red-700">
                        <Phone className="h-5 w-5" />
                        Call +265 986 227 240
                      </Button>
                      <Button size="lg" variant="outline" className="gap-2">
                        <MessageCircle className="h-5 w-5" />
                        WhatsApp Emergency
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;