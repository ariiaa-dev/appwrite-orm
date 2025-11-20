"use client";

import { motion } from "framer-motion";
import { Database, BookOpen, Github, ExternalLink, Send } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { CursorEffect } from "../components/cursor-effect";
import { WebORM } from "appwrite-orm";
import { useEffect, useState } from "react";

export default function ToolsPage() {
  // Initialize WebORM
  const orm = new WebORM({
    endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || '',
    projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '',
    databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '',
  });
  const [showcaseProjects, setShowcaseProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    projectName: "",
    description: "",
    projectUrl: "",
    githubUrl: "",
    tags: "",
    contactEmail: "",
  });
  const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  useEffect(() => {
    loadShowcaseProjects();
  }, []);

  async function loadShowcaseProjects() {
    try {
      const db = await orm.init([
        {
          name: 'showcase',
          schema: {
            name: { type: 'string' as const, required: true },
            description: { type: 'string' as const, required: true },
            link: { type: 'string' as const, required: true },
            github: { type: 'string' as const, required: true },
            tags: { type: 'string' as const, array: true, required: true },
            approved: { type: 'boolean' as const, required: true, default: false },
            createdAt: { type: 'datetime' as const, required: true },
          }
        }
      ]);

      const projects = await db.table('showcase').query({ approved: true });
      setShowcaseProjects(projects);
    } catch (error) {
      console.error('Failed to load showcase projects:', error);
      // Fallback to static data
      setShowcaseProjects([
        {
          name: "Appwrite ORM",
          description: "Type-safe TypeScript ORM for Appwrite with automatic migrations, schema validation, and join support",
          link: "/",
          github: "https://github.com/raisfeld-ori/appwrite-orm",
          tags: ["TypeScript", "ORM", "Database"]
        }
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setSubmitStatus(null);

    try {
      const db = await orm.init([
        {
          name: 'requests',
          schema: {
            projectName: { type: 'string' as const, required: true },
            description: { type: 'string' as const, required: true },
            projectUrl: { type: 'string' as const, required: true },
            githubUrl: { type: 'string' as const, required: true },
            tags: { type: 'string' as const, required: true },
            contactEmail: { type: 'string' as const, required: true },
            status: { type: 'string' as const, required: true, default: 'pending' },
            submittedAt: { type: 'datetime' as const, required: true },
          }
        }
      ]);
      console.log("1")
      await db.table('requests').create({
        projectName: formData.projectName,
        description: formData.description,
        projectUrl: formData.projectUrl,
        githubUrl: formData.githubUrl,
        tags: formData.tags,
        contactEmail: formData.contactEmail,
        status: 'pending',
        submittedAt: new Date().toISOString(),
      } as any);
      console.log("2")
      setSubmitStatus({ type: 'success', message: 'Your project has been submitted for review!' });
      setFormData({
        projectName: "",
        description: "",
        projectUrl: "",
        githubUrl: "",
        tags: "",
        contactEmail: "",
      });
    } catch (error: any) {
      setSubmitStatus({ type: 'error', message: error?.message || 'Failed to submit project. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  }

  const tools = showcaseProjects;

  return (
    <div className="relative min-h-screen overflow-hidden cursor-none">
      <CursorEffect />
      {/* Hexagonal Background */}
      <div className="absolute inset-0 bg-white dark:bg-gray-950">
        <div className="absolute inset-0 opacity-[0.2] dark:opacity-[0.15]">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="hexagons" width="50" height="43.4" patternUnits="userSpaceOnUse" patternTransform="scale(2)">
                <path 
                  d="M25 0 L50 14.4 L50 38.4 L25 51.8 L0 38.4 L0 14.4 Z" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="1"
                  className="text-[--color-primary-400]/40 dark:text-[--color-primary-400]/30"
                />
                <path 
                  d="M25 0 L50 14.4 L50 38.4 L25 51.8 L0 38.4 L0 14.4 Z" 
                  transform="translate(50, 25.9)" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="1"
                  className="text-[--color-primary-500]/40 dark:text-[--color-primary-500]/30"
                />
              </pattern>
              
              <linearGradient id="hex-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fd366e" stopOpacity="0.1" />
                <stop offset="50%" stopColor="#f02e65" stopOpacity="0.1" />
                <stop offset="100%" stopColor="#e01e5a" stopOpacity="0.1" />
              </linearGradient>
            </defs>
            
            <rect width="100%" height="100%" fill="url(#hexagons)" />
            <rect width="100%" height="100%" fill="url(#hex-gradient)" />
          </svg>
        </div>
        
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(253,54,110,0.15),transparent_60%)] dark:bg-[radial-gradient(ellipse_at_top_left,rgba(253,54,110,0.1),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(240,46,101,0.15),transparent_60%)] dark:bg-[radial-gradient(ellipse_at_bottom_right,rgba(240,46,101,0.1),transparent_60%)]" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Navigation */}
        <motion.nav
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="container mx-auto px-6 py-3"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Image 
                src="/logo-icon.png" 
                alt="Appwrite ORM Logo" 
                width={32} 
                height={32}
                className="h-8 w-8"
              />
              <span className="text-2xl font-bold bg-gradient-to-r from-[--color-primary-500] to-[--color-primary-600] bg-clip-text text-transparent">
                Appwrite Tools
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-[--color-primary-500] dark:hover:text-[--color-primary-400] transition-colors"
              >
                ← Back to ORM
              </Link>
              <a 
                href="https://appwrite-orm.readthedocs.io"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-[--color-primary-500] dark:hover:text-[--color-primary-400] transition-colors"
              >
                <BookOpen className="h-4 w-4" />
                Docs
              </a>
              <a 
                href="https://github.com/raisfeld-ori/appwrite-orm"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-[--color-primary-500] dark:hover:text-[--color-primary-400] transition-colors"
              >
                <Github className="h-4 w-4" />
                GitHub
              </a>
            </div>
          </div>
        </motion.nav>

        {/* Hero Section */}
        <div className="container mx-auto px-6 py-12 lg:py-20">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              <span className="text-gray-900 dark:text-white">
                Appwrite
              </span>
              <br />
              <span className="bg-gradient-to-r from-red-500 via-pink-600 to-pink-700 bg-clip-text text-transparent">
                Tools & Extensions
              </span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
              A collection of useful tools, extensions, and utilities for Appwrite developers
            </p>
          </motion.div>

          {/* Tools Grid */}
          <div className="max-w-5xl mx-auto">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[--color-primary-500] border-r-transparent"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-400">Loading projects...</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {tools.map((tool, index) => (
                <motion.div
                  key={index}
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className={cn(
                    "group p-8 rounded-xl",
                    "bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl",
                    "border border-white/50 dark:border-gray-800/50",
                    "hover:shadow-xl hover:shadow-[--color-primary-500]/10 dark:hover:shadow-[--color-primary-500]/5",
                    "transition-all duration-300"
                  )}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={cn(
                      "p-3 rounded-lg",
                      "bg-gradient-to-br from-[--color-primary-500] to-[--color-primary-600]",
                      "group-hover:scale-110 transition-transform duration-300"
                    )}>
                      <Database className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex gap-2">
                      <a
                        href={tool.link}
                        className="p-2 rounded-lg bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800 transition-colors"
                        title="View Project"
                      >
                        <ExternalLink className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                      </a>
                      <a
                        href={tool.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800 transition-colors"
                        title="View on GitHub"
                      >
                        <Github className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                      </a>
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-white">
                    {tool.name}
                  </h3>
                  
                  <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                    {tool.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2">
                    {tool.tags.map((tag: string, tagIndex: number) => (
                      <span
                        key={tagIndex}
                        className="px-3 py-1 rounded-full text-xs font-medium bg-[--color-primary-100] dark:bg-[--color-primary-600]/20 text-[--color-primary-700] dark:text-[--color-primary-300]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
              </div>
            )}
          </div>

          {/* Submit Your Project Section */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-20"
          >
            <div className="max-w-3xl mx-auto">
              <div className={cn(
                "p-8 md:p-12 rounded-xl",
                "bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl",
                "border border-white/50 dark:border-gray-800/50"
              )}>
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold mb-3 text-gray-900 dark:text-white">
                    Submit Your Project
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Built something cool with Appwrite? Share it with the community!
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="projectName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Project Name *
                    </label>
                    <input
                      type="text"
                      id="projectName"
                      required
                      value={formData.projectName}
                      onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                      className={cn(
                        "w-full px-4 py-3 rounded-lg",
                        "bg-white/50 dark:bg-gray-800/50",
                        "border border-gray-300 dark:border-gray-700",
                        "focus:outline-none focus:ring-2 focus:ring-[--color-primary-500]",
                        "text-gray-900 dark:text-white",
                        "placeholder-gray-500 dark:placeholder-gray-400"
                      )}
                      placeholder="My Awesome Project"
                    />
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description *
                    </label>
                    <textarea
                      id="description"
                      required
                      rows={4}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className={cn(
                        "w-full px-4 py-3 rounded-lg",
                        "bg-white/50 dark:bg-gray-800/50",
                        "border border-gray-300 dark:border-gray-700",
                        "focus:outline-none focus:ring-2 focus:ring-[--color-primary-500]",
                        "text-gray-900 dark:text-white",
                        "placeholder-gray-500 dark:placeholder-gray-400"
                      )}
                      placeholder="A brief description of your project..."
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="projectUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Project URL *
                      </label>
                      <input
                        type="url"
                        id="projectUrl"
                        required
                        value={formData.projectUrl}
                        onChange={(e) => setFormData({ ...formData, projectUrl: e.target.value })}
                        className={cn(
                          "w-full px-4 py-3 rounded-lg",
                          "bg-white/50 dark:bg-gray-800/50",
                          "border border-gray-300 dark:border-gray-700",
                          "focus:outline-none focus:ring-2 focus:ring-[--color-primary-500]",
                          "text-gray-900 dark:text-white",
                          "placeholder-gray-500 dark:placeholder-gray-400"
                        )}
                        placeholder="https://myproject.com"
                      />
                    </div>

                    <div>
                      <label htmlFor="githubUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        GitHub URL *
                      </label>
                      <input
                        type="url"
                        id="githubUrl"
                        required
                        value={formData.githubUrl}
                        onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                        className={cn(
                          "w-full px-4 py-3 rounded-lg",
                          "bg-white/50 dark:bg-gray-800/50",
                          "border border-gray-300 dark:border-gray-700",
                          "focus:outline-none focus:ring-2 focus:ring-[--color-primary-500]",
                          "text-gray-900 dark:text-white",
                          "placeholder-gray-500 dark:placeholder-gray-400"
                        )}
                        placeholder="https://github.com/user/repo"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Tags (comma-separated) *
                      </label>
                      <input
                        type="text"
                        id="tags"
                        required
                        value={formData.tags}
                        onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                        className={cn(
                          "w-full px-4 py-3 rounded-lg",
                          "bg-white/50 dark:bg-gray-800/50",
                          "border border-gray-300 dark:border-gray-700",
                          "focus:outline-none focus:ring-2 focus:ring-[--color-primary-500]",
                          "text-gray-900 dark:text-white",
                          "placeholder-gray-500 dark:placeholder-gray-400"
                        )}
                        placeholder="React, TypeScript, API"
                      />
                    </div>

                    <div>
                      <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Contact Email *
                      </label>
                      <input
                        type="email"
                        id="contactEmail"
                        required
                        value={formData.contactEmail}
                        onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                        className={cn(
                          "w-full px-4 py-3 rounded-lg",
                          "bg-white/50 dark:bg-gray-800/50",
                          "border border-gray-300 dark:border-gray-700",
                          "focus:outline-none focus:ring-2 focus:ring-[--color-primary-500]",
                          "text-gray-900 dark:text-white",
                          "placeholder-gray-500 dark:placeholder-gray-400"
                        )}
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>

                  {submitStatus && (
                    <div className={cn(
                      "p-4 rounded-lg",
                      submitStatus.type === 'success' 
                        ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                        : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"
                    )}>
                      {submitStatus.message}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className={cn(
                      "w-full flex items-center justify-center gap-2 px-6 py-4 rounded-lg",
                      "bg-gradient-to-r from-[--color-primary-500] to-[--color-primary-600]",
                      "text-white font-medium",
                      "hover:from-[--color-primary-600] hover:to-[--color-primary-700]",
                      "focus:outline-none focus:ring-2 focus:ring-[--color-primary-500] focus:ring-offset-2",
                      "transition-all duration-200",
                      "disabled:opacity-50 disabled:cursor-not-allowed",
                      "cursor-pointer"
                    )}
                  >
                    <Send className="h-5 w-5" />
                    {submitting ? 'Submitting...' : 'Submit Project'}
                  </button>
                </form>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Footer */}
        <footer className="container mx-auto px-6 py-8 border-t border-gray-200 dark:border-gray-800">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-[--color-primary-500] dark:text-[--color-primary-400]" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Appwrite Tools © {new Date().getFullYear()}
              </span>
            </div>
            <div className="flex items-center gap-6">
              <a 
                href="https://www.npmjs.com/package/appwrite-orm"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-[--color-primary-500] dark:hover:text-[--color-primary-400] transition-colors"
              >
                npm
              </a>
              <a 
                href="https://github.com/raisfeld-ori/appwrite-orm"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-[--color-primary-500] dark:hover:text-[--color-primary-400] transition-colors"
              >
                GitHub
              </a>
              <a 
                href="https://appwrite-orm.readthedocs.io"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-[--color-primary-500] dark:hover:text-[--color-primary-400] transition-colors"
              >
                Documentation
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
