import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useInvestigation } from '../context/InvestigationContext';
import {
  FolderGit2,
  GitGraph,
  FileCheck,
  Split,
  UploadCloud,
  Calendar,
  Shield,
  Coins,
  User,
  FileText,
  Clock,
  ArrowRight
} from 'lucide-react';

export const CaseOverviewView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { cases, selectCase, selectedCase, documents, extractions, matches } = useInvestigation();

  const caseData = cases.find((c) => c.id === id) || selectedCase || cases[0];

  useEffect(() => {
    if (id && (!selectedCase || selectedCase.id !== id)) {
      selectCase(id);
    }
  }, [id, selectCase, selectedCase]);

  if (!caseData) return null;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6 text-slate-200">
      {/* Top Banner with Quick Actions */}
      <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <span className="text-sm font-mono font-bold text-cyan-400 bg-cyan-950 px-2.5 py-0.5 rounded border border-cyan-800">
              {caseData.firNumber}
            </span>
            <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950 px-2 py-0.5 rounded border border-amber-800">
              {caseData.status}
            </span>
            <span className="text-xs text-slate-400">
              {caseData.policeStation}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-2">
            {caseData.title}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Investigating Officer: <strong className="text-slate-200">{caseData.investigatingOfficer}</strong> • Registered: <span className="font-mono text-slate-300">{caseData.registrationDate}</span>
          </p>
        </div>

        {/* Primary Action Button */}
        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={() => navigate(`/cases/${caseData.id}/investigation`)}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-xs shadow-lg shadow-cyan-950/60 transition-all"
          >
            <GitGraph className="w-4 h-4" />
            <span>Launch Investigation Canvas</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-3 text-xs">
        <Link
          to={`/cases/${caseData.id}/investigation`}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-cyan-300 border border-slate-700 hover:border-cyan-500"
        >
          <GitGraph className="w-3.5 h-3.5 text-cyan-400" />
          <span>Investigation Graph & Timeline</span>
        </Link>
        <Link
          to={`/cases/${caseData.id}/extraction`}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700"
        >
          <FileCheck className="w-3.5 h-3.5 text-amber-400" />
          <span>Extraction Review</span>
        </Link>
        <Link
          to={`/cases/${caseData.id}/matches`}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700"
        >
          <Split className="w-3.5 h-3.5 text-emerald-400" />
          <span>Entity Match Review</span>
        </Link>
        <Link
          to={`/cases/${caseData.id}/upload`}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700"
        >
          <UploadCloud className="w-3.5 h-3.5 text-purple-400" />
          <span>Document Ingestion</span>
        </Link>
      </div>

      {/* Case Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Description & Legal Sections */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900/80 rounded-2xl p-6 border border-slate-800 shadow-md">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center space-x-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              <span>Case Synopsis & Modus Operandi</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {caseData.description}
            </p>

            {/* Legal Sections of Law */}
            <div className="mt-5 pt-4 border-t border-slate-800">
              <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block mb-2">
                Sections of Law Invoked:
              </span>
              <div className="flex flex-wrap gap-2">
                {caseData.sections.map((sec, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-slate-950 font-mono text-xs font-semibold text-amber-300 border border-slate-800"
                  >
                    {sec}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Ingested Documents */}
          <div className="bg-slate-900/80 rounded-2xl p-6 border border-slate-800 shadow-md">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
                <UploadCloud className="w-4 h-4 text-purple-400" />
                <span>Ingested Case Evidentiary Documents ({documents.length})</span>
              </h3>
              <Link
                to={`/cases/${caseData.id}/upload`}
                className="text-xs text-cyan-400 hover:underline flex items-center space-x-1"
              >
                <span>Upload New</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="space-y-2">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs"
                >
                  <div className="flex items-center space-x-3">
                    <FileText className="w-4 h-4 text-slate-400" />
                    <div>
                      <span className="font-semibold text-slate-200 block">{doc.fileName}</span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {doc.fileSize} • {doc.pageCount} Pages • Uploaded {doc.uploadTimestamp}
                      </span>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    {doc.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Case Metrics & Accused/Victim Summary */}
        <div className="space-y-6">
          <div className="bg-slate-900/80 rounded-2xl p-6 border border-slate-800 shadow-md">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-4 flex items-center space-x-2">
              <Coins className="w-4 h-4 text-emerald-400" />
              <span>Financial Impact</span>
            </h3>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] uppercase font-mono text-slate-400 block">Total Fraud Amount Siphoned</span>
              <span className="text-2xl font-bold font-mono text-emerald-400 mt-1 block">
                ₹{caseData.totalLossInr.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-slate-500 mt-1 block">
                Across NetBanking IMPS & Layered UPI Handles
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4 text-xs font-mono">
              <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800 text-center">
                <span className="text-[9px] text-slate-500 uppercase block">Victims</span>
                <span className="text-lg font-bold text-white mt-0.5 block">{caseData.victimCount}</span>
              </div>
              <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800 text-center">
                <span className="text-[9px] text-slate-500 uppercase block">Identified Accused</span>
                <span className="text-lg font-bold text-rose-400 mt-0.5 block">{caseData.accusedCount}</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/80 rounded-2xl p-6 border border-slate-800 shadow-md">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center space-x-2">
              <User className="w-4 h-4 text-cyan-400" />
              <span>Key Profile Entities</span>
            </h3>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex justify-between items-center">
                <div>
                  <span className="font-semibold text-rose-300 block">Vikram Sharma @ Vicky</span>
                  <span className="text-[10px] text-slate-500">Prime Accused / Jamtara Handler</span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300">
                  92% Risk
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex justify-between items-center">
                <div>
                  <span className="font-semibold text-blue-300 block">Dr. K. Ramanathan</span>
                  <span className="text-[10px] text-slate-500">Complainant / Target</span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300">
                  Victim
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex justify-between items-center">
                <div>
                  <span className="font-semibold text-teal-300 block">Ramesh Yadav</span>
                  <span className="text-[10px] text-slate-500">Mule Account Holder</span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300">
                  78% Risk
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
