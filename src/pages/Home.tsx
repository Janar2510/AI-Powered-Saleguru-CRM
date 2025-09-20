import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PlayCircle, ArrowRight, Sparkles, CheckCircle, Star, Users, Zap, Shield, BarChart3, Target, Clock } from 'lucide-react';
import Spline from '@splinetool/react-spline';
import { BrandPageLayout } from '../design/BrandPageLayout';
import { BrandCard } from '../design/BrandCard';
import { BrandButton } from '../design/BrandButton';

const Home: React.FC = () => {
  const [splineError, setSplineError] = useState(false);

  const handleSplineError = () => {
    setSplineError(true);
    console.error('Failed to load Spline scene');
  };

  const features = [
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: "AI-Powered Analytics",
      description: "Get intelligent insights and predictions to optimize your sales performance"
    },
    {
      icon: <Target className="h-8 w-8" />,
      title: "Smart Lead Scoring",
      description: "Automatically prioritize leads based on AI analysis and behavioral patterns"
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Workflow Automation",
      description: "Streamline your sales process with intelligent automation and workflows"
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Team Collaboration",
      description: "Work together seamlessly with real-time collaboration and communication tools"
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Enterprise Security",
      description: "Bank-level security with advanced encryption and compliance standards"
    },
    {
      icon: <Clock className="h-8 w-8" />,
      title: "24/7 Support",
      description: "Round-the-clock support from our dedicated customer success team"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      company: "TechCorp Inc.",
      role: "Sales Director",
      content: "SaleToru has transformed our sales process. We've seen a 40% increase in conversion rates since implementing their AI-powered lead scoring.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face"
    },
    {
      name: "Michael Chen",
      company: "Growth Solutions",
      role: "VP of Sales",
      content: "The automation features have saved us countless hours. Our team can now focus on building relationships instead of manual data entry.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
    },
    {
      name: "Emily Rodriguez",
      company: "Innovate Labs",
      role: "Sales Manager",
      content: "The analytics dashboard gives us insights we never had before. We can now make data-driven decisions that actually move the needle.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face"
    }
  ];

  return (
    <BrandPageLayout>
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
          {/* 3D Background */}
          <div className="absolute inset-0 opacity-20">
            {!splineError ? (
              <Spline
                scene="https://prod.spline.design/6WZ1Z3YyM8q3Z3Yy/6WZ1Z3YyM8q3Z3Yy.splinecode"
                onError={handleSplineError}
                style={{ width: '100%', height: '100%' }}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-500/20 to-purple-500/20" />
            )}
          </div>

          <div className="relative z-10 container mx-auto px-4 py-20">
            <div className="text-center max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="mb-8"
              >
                <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
                  AI-Powered
                  <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    {" "}Sales CRM
                  </span>
                </h1>
                <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
                  Transform your sales process with intelligent automation, predictive analytics, and seamless team collaboration.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
              >
                <BrandButton size="lg" className="text-lg px-8 py-4">
                  <PlayCircle className="w-5 h-5 mr-2" />
                  Start Free Trial
                </BrandButton>
                <BrandButton variant="outline" size="lg" className="text-lg px-8 py-4">
                  <ArrowRight className="w-5 h-5 mr-2" />
                  Watch Demo
                </BrandButton>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto"
              >
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-2">40%</div>
                  <div className="text-gray-300">Increase in Conversion</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-2">50K+</div>
                  <div className="text-gray-300">Happy Customers</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-2">99.9%</div>
                  <div className="text-gray-300">Uptime Guarantee</div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Everything you need to grow your sales
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Powerful features designed to help you close more deals, faster.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <BrandCard className="h-full p-6 text-center hover:shadow-lg transition-shadow">
                    <div className="text-blue-600 mb-4 flex justify-center">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600">
                      {feature.description}
                    </p>
                  </BrandCard>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Trusted by sales teams worldwide
              </h2>
              <p className="text-xl text-gray-600">
                See what our customers have to say about SaleToru
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <BrandCard className="p-6 h-full">
                    <div className="flex items-center mb-4">
                      <img
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        className="w-12 h-12 rounded-full mr-4"
                      />
                      <div>
                        <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                        <p className="text-sm text-gray-600">{testimonial.role}, {testimonial.company}</p>
                      </div>
                    </div>
                    <div className="flex mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <p className="text-gray-700 italic">"{testimonial.content}"</p>
                  </BrandCard>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl font-bold text-white mb-4">
                Ready to transform your sales process?
              </h2>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Join thousands of sales teams who have already revolutionized their workflow with SaleToru.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <BrandButton size="lg" className="text-lg px-8 py-4 bg-white text-blue-600 hover:bg-gray-100">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Start Your Free Trial
                </BrandButton>
                <BrandButton variant="outline" size="lg" className="text-lg px-8 py-4 border-white text-white hover:bg-white hover:text-blue-600">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Schedule Demo
                </BrandButton>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </BrandPageLayout>
  );
};

export default Home;
