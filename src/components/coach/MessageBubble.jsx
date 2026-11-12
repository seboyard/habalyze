import React from 'react';
import ReactMarkdown from 'react-markdown';
import { motion } from 'framer-motion';
import { Brain, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function MessageBubble({ message }) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex gap-3", isUser ? "justify-end" : "justify-start")}
    >
      {!isUser && (
        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 shadow-md">
          <Brain className="w-5 h-5 text-white" />
        </div>
      )}
      
      <div className={cn("max-w-[85%]", isUser && "flex flex-col items-end")}>
        <div
          className={cn(
            "rounded-2xl px-4 py-3 shadow-md",
            isUser
              ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
              : "bg-white border-2 border-purple-200"
          )}
        >
          {isUser ? (
            <p className="text-sm leading-relaxed">{message.content}</p>
          ) : (
            <ReactMarkdown
              className="text-sm prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
              components={{
                p: ({ children }) => (
                  <p className="my-2 leading-relaxed text-gray-800">{children}</p>
                ),
                ul: ({ children }) => (
                  <ul className="my-2 ml-4 list-disc space-y-1 text-gray-800">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="my-2 ml-4 list-decimal space-y-1 text-gray-800">{children}</ol>
                ),
                li: ({ children }) => (
                  <li className="text-gray-800">{children}</li>
                ),
                strong: ({ children }) => (
                  <strong className="font-bold text-purple-700">{children}</strong>
                ),
                em: ({ children }) => (
                  <em className="italic text-gray-700">{children}</em>
                ),
                code: ({ inline, children }) => 
                  inline ? (
                    <code className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 text-xs font-mono">
                      {children}
                    </code>
                  ) : (
                    <code className="block p-2 rounded-lg bg-gray-100 text-gray-800 text-xs font-mono my-2">
                      {children}
                    </code>
                  ),
                h1: ({ children }) => (
                  <h1 className="text-lg font-bold text-gray-900 mt-3 mb-2">{children}</h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-base font-bold text-gray-900 mt-3 mb-2">{children}</h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-sm font-bold text-gray-900 mt-2 mb-1">{children}</h3>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-purple-300 pl-3 my-2 text-gray-700 italic">
                    {children}
                  </blockquote>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          )}
        </div>
      </div>

      {isUser && (
        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center flex-shrink-0 shadow-md">
          <User className="w-5 h-5 text-white" />
        </div>
      )}
    </motion.div>
  );
}