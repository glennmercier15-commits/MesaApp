import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "../context/AuthContext";
import { ChevronLeft } from "lucide-react";
import { theme } from "../theme";

interface EditProfileScreenProps {
  onBack: () => void;
}

export function EditProfileScreen({ onBack }: EditProfileScreenProps) {
  const { user, updateUserDisplayName } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateUserDisplayName(displayName);
      onBack();
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full p-6 space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <h2 className="text-2xl font-serif font-bold" style={{ color: theme.foreground }}>Edit Profile</h2>
      </div>

      <div className="space-y-4">
        <label className="text-xs font-bold uppercase tracking-[0.2em] opacity-40">Display Name</label>
        <Input 
          value={displayName} 
          onChange={(e) => setDisplayName(e.target.value)} 
          className="rounded-2xl glass p-4"
        />
      </div>

      <Button 
        onClick={handleSave} 
        disabled={loading}
        className="w-full h-16 rounded-[2rem] bg-primary text-white font-bold text-sm"
      >
        {loading ? "Saving..." : "Save Changes"}
      </Button>
    </div>
  );
}
