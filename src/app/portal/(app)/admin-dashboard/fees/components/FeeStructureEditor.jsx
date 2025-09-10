// src/app/portal/(app)/admin-dashboard/fees/FeeStructureEditor.jsx
"use client";

import { useState, useEffect } from "react";
import { db } from "@/firebase/config";
import { doc, setDoc, onSnapshot } from "firebase/firestore";
import {
  Plus,
  Trash2,
  Save,
  Loader2,
  Settings,
  ChevronDown,
} from "lucide-react";
import { motion } from "framer-motion";

// --- UI Helper Components ---
const Input = ({ label, ...props }) => (
  <div>
    <label className="block text-xs font-medium text-slate-400 mb-1">
      {label}
    </label>
    <input
      {...props}
      className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-light-slate focus:border-brand-gold focus:ring-1 focus:ring-brand-gold"
    />
  </div>
);

const Select = ({ label, children, ...props }) => (
  <div>
    <label className="block text-xs font-medium text-slate-400 mb-1">
      {label}
    </label>
    <div className="relative">
      <select
        {...props}
        className="w-full appearance-none rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-light-slate focus:border-brand-gold">
        {children}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
    </div>
  </div>
);

// --- New Modal for Selecting a Plan Template ---
const AddPlanModal = ({ isOpen, onClose, onAddPlan }) => {
  if (!isOpen) return null;
  const templates = [
    {
      key: "monthly",
      name: "Monthly Plan",
      desc: "Equal payments every month.",
    },
    {
      key: "quarterly",
      name: "Quarterly Plan",
      desc: "Payments every 3 months.",
    },
    {
      key: "semi-annually",
      name: "Semi-Annually Plan",
      desc: "Payments every 6 months.",
    },
    {
      key: "annually",
      name: "Annual / One-Time Plan",
      desc: "A single lump-sum payment.",
    },
  ];
  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}>
      <motion.div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-dark-navy p-6"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}>
        <h2 className="text-xl font-bold text-brand-gold mb-4">
          Choose a Plan Template
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {templates.map((t) => (
            <button
              key={t.key}
              onClick={() => onAddPlan(t.key)}
              className="p-4 rounded-lg text-left bg-slate-800 hover:bg-slate-700/50 border border-slate-700 transition-colors">
              <p className="font-semibold text-light-slate">{t.name}</p>
              <p className="text-xs text-slate-400 mt-1">{t.desc}</p>
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default function FeeStructureEditor({ batches }) {
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [structure, setStructure] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!selectedBatchId) {
      setStructure(null);
      return;
    }
    setLoading(true);
    const unsub = onSnapshot(
      doc(db, "feeStructures", selectedBatchId),
      (doc) => {
        if (doc.exists()) {
          setStructure(doc.data());
        } else {
          const selectedBatch = batches.find((b) => b.id === selectedBatchId);
          setStructure({
            batchId: selectedBatchId,
            batchName: selectedBatch?.name || "",
            plans: [],
          });
        }
        setLoading(false);
      }
    );
    return () => unsub();
  }, [selectedBatchId, batches]);

  const handleNumberChange = (e) => parseInt(e.target.value, 10) || 0;

  const handleAddPlan = (templateKey) => {
    let newPlan = {
      id: `plan_${Date.now()}`,
      type: templateKey,
      name: "",
      installments: [],
    };
    // Set default values based on the chosen template
    switch (templateKey) {
      case "monthly":
        newPlan.name = "Monthly Installments";
        newPlan.monthlyAmount = 2500;
        newPlan.totalMonths = 11;
        break;
      case "quarterly":
        newPlan.name = "Quarterly Installments";
        newPlan.quarterlyAmount = 7500;
        newPlan.totalQuarters = 4;
        break;
      case "semi-annually":
        newPlan.name = "Semi-Annual Installments";
        newPlan.semiAnnualAmount = 12500;
        newPlan.totalInstallments = 2;
        break;
      case "annually":
        newPlan.name = "One-Time Payment";
        newPlan.totalAmount = 25000;
        newPlan.discount = 1500;
        break;
    }
    setStructure((prev) => ({
      ...prev,
      plans: [...(prev.plans || []), newPlan],
    }));
    setIsModalOpen(false);
  };

  const generateInstallmentsForPlan = (plan) => {
    let installments = [];
    switch (plan.type) {
      case "monthly":
        for (let i = 0; i < plan.totalMonths; i++) {
          installments.push({
            description: `Month ${i + 1} Fee`,
            amount: plan.monthlyAmount,
            offsetMonths: i,
          });
        }
        break;
      case "quarterly":
        for (let i = 0; i < plan.totalQuarters; i++) {
          installments.push({
            description: `Quarter ${i + 1} Fee`,
            amount: plan.quarterlyAmount,
            offsetMonths: i * 3,
          });
        }
        break;
      case "semi-annually":
        for (let i = 0; i < plan.totalInstallments; i++) {
          installments.push({
            description: `Installment ${i + 1}`,
            amount: plan.semiAnnualAmount,
            offsetMonths: i * 6,
          });
        }
        break;
      case "annually":
        installments.push({
          description: "Full Payment",
          amount: plan.totalAmount - (plan.discount || 0),
          offsetMonths: 0,
        });
        break;
    }
    return installments;
  };

  const saveStructure = async () => {
    if (!selectedBatchId) return;
    setSaving(true);
    try {
      const structureToSave = {
        ...structure,
        plans: structure.plans.map((p) => ({
          ...p,
          installments: generateInstallmentsForPlan(p),
        })),
      };
      await setDoc(doc(db, "feeStructures", selectedBatchId), structureToSave);
      alert("Fee structure saved successfully!");
    } catch (error) {
      console.error("Error saving fee structure: ", error);
      alert("Error: Could not save fee structure.");
    } finally {
      setSaving(false);
    }
  };

  const handlePlanChange = (planIndex, field, value) => {
    const newPlans = [...structure.plans];
    newPlans[planIndex][field] = value;
    setStructure((prev) => ({ ...prev, plans: newPlans }));
  };

  const removePlan = (planIndex) => {
    const newPlans = structure.plans.filter((_, idx) => idx !== planIndex);
    setStructure((prev) => ({ ...prev, plans: newPlans }));
  };

  return (
    <>
      <AddPlanModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddPlan={handleAddPlan}
      />
      <div className="rounded-2xl border border-white/10 bg-slate-900/20 p-6 backdrop-blur-lg">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6 pb-6 border-b border-slate-700/50">
          <div>
            <h2 className="text-xl font-bold text-light-slate flex items-center gap-2">
              <Settings size={20} /> Fee Plan Editor
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Define payment structures for each batch.
            </p>
          </div>
          <div className="w-full sm:w-64">
            <Select
              label="Select a Batch to Edit"
              value={selectedBatchId}
              onChange={(e) => setSelectedBatchId(e.target.value)}>
              <option value="">-- Select Batch --</option>
              {batches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {loading && (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="animate-spin text-brand-gold" />
          </div>
        )}
        {!selectedBatchId && !loading && (
          <div className="text-center py-10 text-slate-500">
            Please select a batch to begin editing its fee structure.
          </div>
        )}

        {structure && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6">
            {structure.plans &&
              structure.plans.map((plan, pIndex) => (
                <div
                  key={plan.id}
                  className="rounded-xl border border-slate-700 bg-slate-800/30 p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-grow pr-4">
                      <Input
                        label="Plan Name"
                        value={plan.name}
                        onChange={(e) =>
                          handlePlanChange(pIndex, "name", e.target.value)
                        }
                      />
                    </div>
                    <button
                      onClick={() => removePlan(pIndex)}
                      className="p-2 text-red-400 hover:bg-red-500/10 rounded-full">
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {plan.type === "monthly" && (
                      <>
                        <Input
                          label="Amount per Month (₹)"
                          type="number"
                          value={plan.monthlyAmount}
                          onChange={(e) =>
                            handlePlanChange(
                              pIndex,
                              "monthlyAmount",
                              handleNumberChange(e)
                            )
                          }
                        />
                        <Input
                          label="Number of Months"
                          type="number"
                          value={plan.totalMonths}
                          onChange={(e) =>
                            handlePlanChange(
                              pIndex,
                              "totalMonths",
                              handleNumberChange(e)
                            )
                          }
                        />
                      </>
                    )}
                    {plan.type === "quarterly" && (
                      <>
                        <Input
                          label="Amount per Quarter (₹)"
                          type="number"
                          value={plan.quarterlyAmount}
                          onChange={(e) =>
                            handlePlanChange(
                              pIndex,
                              "quarterlyAmount",
                              handleNumberChange(e)
                            )
                          }
                        />
                        <Input
                          label="Number of Quarters"
                          type="number"
                          value={plan.totalQuarters}
                          onChange={(e) =>
                            handlePlanChange(
                              pIndex,
                              "totalQuarters",
                              handleNumberChange(e)
                            )
                          }
                        />
                      </>
                    )}
                    {plan.type === "semi-annually" && (
                      <>
                        <Input
                          label="Amount per Installment (₹)"
                          type="number"
                          value={plan.semiAnnualAmount}
                          onChange={(e) =>
                            handlePlanChange(
                              pIndex,
                              "semiAnnualAmount",
                              handleNumberChange(e)
                            )
                          }
                        />
                        <Input
                          label="Number of Installments"
                          type="number"
                          value={plan.totalInstallments}
                          onChange={(e) =>
                            handlePlanChange(
                              pIndex,
                              "totalInstallments",
                              handleNumberChange(e)
                            )
                          }
                        />
                      </>
                    )}
                    {plan.type === "annually" && (
                      <>
                        <Input
                          label="Total Amount (₹)"
                          type="number"
                          value={plan.totalAmount}
                          onChange={(e) =>
                            handlePlanChange(
                              pIndex,
                              "totalAmount",
                              handleNumberChange(e)
                            )
                          }
                        />
                        <Input
                          label="Discount on Full Payment (₹)"
                          type="number"
                          value={plan.discount || 0}
                          onChange={(e) =>
                            handlePlanChange(
                              pIndex,
                              "discount",
                              handleNumberChange(e)
                            )
                          }
                        />
                      </>
                    )}
                  </div>
                </div>
              ))}
            <div className="flex justify-between items-center pt-4 border-t border-slate-700/50 mt-6">
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md bg-brand-gold/20 text-brand-gold hover:bg-brand-gold/30">
                <Plus size={16} /> Add Plan from Template
              </button>
              <button
                onClick={saveStructure}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold rounded-md bg-brand-gold text-dark-navy hover:bg-yellow-400 disabled:bg-slate-600">
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                Save Fee Structure
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </>
  );
}
