import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import Confetti from "../components/Confetti";
import Footer from "../components/Footer";

export default function Confirmacao() {
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden">
      {showConfetti && <Confetti />}

      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-green-500/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-secondary/10 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: "spring" }}
        className="relative z-10 flex flex-col items-center text-center max-w-md w-full"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-24 h-24 rounded-full bg-green-500/10 flex items-center justify-center mb-6"
        >
          <CheckCircle className="w-14 h-14 text-green-500" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card rounded-2xl p-8 shadow-xl shadow-green-500/5 border border-border/50 w-full"
        >
          <h1 className="font-heading text-3xl font-extrabold text-foreground mb-2">
            Obrigado! 🎉
          </h1>
          <p className="text-muted-foreground font-body mb-8">
            Sua avaliação foi registrada com sucesso.
            <br />
            Ela nos ajuda a melhorar cada vez mais!
          </p>

          <Link to="/">
            <Button
              variant="outline"
              size="lg"
              className="w-full font-heading font-bold rounded-xl py-5 border-2 hover:bg-muted/50 transition-all"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Início
            </Button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex items-center gap-4 mt-8 text-3xl"
        >
          <span>🎈</span>
          <span>💖</span>
          <span>🎊</span>
        </motion.div>
      </motion.div>
      <Footer />
    </div>
  );
}