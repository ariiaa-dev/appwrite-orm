"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Database, Download, AlertCircle, CheckCircle2, Code2 } from "lucide-react";
import { SqlMigrations, FirebaseMigrations, TextMigrations, TableDefinition } from "appwrite-orm";
import { cn } from "@/lib/utils";

type ExportFormat = 'sql' | 'firebase' | 'text';

const exampleSchema = `[
  {
    "name": "users",
    "schema": {
      "name": { "type": "string", "required": true, "size": 100 },
      "email": { "type": "string", "required": true },
      "age": { "type": "integer", "min": 0, "max": 120 },
      "isActive": { "type": "boolean", "default": true }
    },
    "indexes": [
      { "key": "email_idx", "type": "unique", "attributes": ["email"] }
    ]
  }
]`;

export function MigrationsDemo() {
  const [jsonInput, setJsonInput] = useState(exampleSchema);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleExport = async (format: ExportFormat) => {
    setLoading(true);
    setError("");
    setOutput("");

    try {
      let tables: TableDefinition[];
      try {
        tables = JSON.parse(jsonInput);
      } catch (e) {
        throw new Error("Invalid JSON format. Please check your input.");
      }

      if (!Array.isArray(tables)) {
        throw new Error("Input must be an array of table definitions.");
      }

      for (const table of tables) {
        if (!table.name || typeof table.name !== 'string') {
          throw new Error('Invalid table: each table must have a name');
        }
        if (!table.schema || typeof table.schema !== 'object') {
          throw new Error(`Invalid table ${table.name}: must have a schema object`);
        }
      }

      const mockConfig = {
        endpoint: 'https://demo.appwrite.io/v1',
        projectId: 'demo-project',
        databaseId: 'demo-database'
      };

      let result: string;

      switch (format) {
        case 'sql': {
          const sqlMigrations = new SqlMigrations(mockConfig);
          result = sqlMigrations.generateSQL(tables);
          break;
        }
        case 'firebase': {
          const firebaseMigrations = new FirebaseMigrations(mockConfig);
          result = firebaseMigrations.generateFirebase(tables);
          break;
        }
        case 'text': {
          const textMigrations = new TextMigrations(mockConfig);
          result = textMigrations.generateText(tables);
          break;
        }
        default:
          throw new Error('Unsupported format');
      }

      setOutput(result);
    } catch (err: any) {
      setError(err.message || "An error occurred during export");
    } finally {
      setLoading(false);
    }
  };

  const downloadOutput = () => {
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `migration-output.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mb-8 p-6 rounded-xl bg-white/20 dark:bg-gray-900/20 backdrop-blur-xl border border-white/30 dark:border-gray-800/30"
      >
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Database className="h-5 w-5 text-red-500" />
          Migration Functions
        </h2>
        <div className="space-y-2 font-mono text-sm">
          <p className="text-gray-600 dark:text-gray-400">
            // Export your schema to different formats:
          </p>
          <div className="bg-white/20 dark:bg-gray-900/20 p-4 rounded-lg backdrop-blur-sm border border-white/20 dark:border-gray-800/20">
            <code className="text-black dark:text-white">
              db.exportToSQL()<br/>
              db.exportToFirebase()<br/>
              db.exportToText()
            </code>
          </div>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="p-6 rounded-xl bg-white/20 dark:bg-gray-900/20 backdrop-blur-xl border border-white/30 dark:border-gray-800/30"
        >
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Code2 className="h-5 w-5 text-red-500" />
            Schema Input (JSON)
          </h3>
          
          <textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            className="w-full h-96 p-4 rounded-lg font-mono text-sm bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-300/50 dark:border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
            placeholder="Enter your table definitions as JSON array..."
          />

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={() => handleExport('sql')}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              <Database className="h-4 w-4" />
              Export to SQL
            </button>

            <button
              onClick={() => handleExport('firebase')}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              <Database className="h-4 w-4" />
              Export to Firebase
            </button>

            <button
              onClick={() => handleExport('text')}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              <Database className="h-4 w-4" />
              Export to Text
            </button>
          </div>
        </motion.div>

        {/* Output Section */}
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="p-6 rounded-xl bg-white/20 dark:bg-gray-900/20 backdrop-blur-xl border border-white/30 dark:border-gray-800/30"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Download className="h-5 w-5 text-red-500" />
              Output
            </h3>
            {output && (
              <button
                onClick={downloadOutput}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-red-500 hover:bg-red-600 text-white transition-all"
              >
                <Download className="h-4 w-4" />
                Download
              </button>
            )}
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-lg mb-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 flex items-start gap-3"
            >
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-800 dark:text-red-300">Error</p>
                <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
              </div>
            </motion.div>
          )}

          {loading && (
            <div className="flex items-center justify-center h-96">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
            </div>
          )}

          {!loading && !error && output && (
            <pre className="w-full h-96 p-4 rounded-lg font-mono text-sm overflow-auto bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-300/50 dark:border-gray-700/50 text-gray-800 dark:text-gray-200">
              {output}
            </pre>
          )}

          {!loading && !error && !output && (
            <div className="flex flex-col items-center justify-center h-96 text-gray-500 dark:text-gray-400">
              <CheckCircle2 className="h-16 w-16 mb-4 opacity-50" />
              <p className="text-center">
                Click one of the export buttons to see the output
              </p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Info Section */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-8 p-6 rounded-xl bg-[--color-primary-100]/50 dark:bg-[--color-primary-600]/20 border border-[--color-primary-200] dark:border-[--color-primary-600]/50"
      >
        <h3 className="text-lg font-bold mb-2 text-[--color-primary-800] dark:text-[--color-primary-300]">
          How to use:
        </h3>
        <ul className="space-y-2 text-sm text-[--color-primary-800] dark:text-[--color-primary-300]">
          <li>• Enter your table definitions as a JSON array in the input field</li>
          <li>• Each table should have a <code className="px-1 py-0.5 rounded bg-white/50 dark:bg-gray-900/50">name</code> and <code className="px-1 py-0.5 rounded bg-white/50 dark:bg-gray-900/50">schema</code> property</li>
          <li>• Click one of the export buttons to convert your schema</li>
          <li>• Download the output or copy it directly from the output panel</li>
        </ul>
      </motion.div>
    </div>
  );
}
