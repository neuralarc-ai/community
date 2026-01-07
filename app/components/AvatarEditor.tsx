"use client";

import { useState, useMemo, type ComponentType } from "react";
import { createAvatar } from "@dicebear/core";
import { openPeeps } from "@dicebear/collection";
import { Button } from "@/components/ui/button";
import {
  RefreshCw,
  Save,
  X,
  User,
  Smile,
  Sun,
  Palette,
  Scissors,
  Shield,
} from "lucide-react";
import Image from "next/image";
import { createClient } from "@/app/lib/supabaseClient";
import { useEffect } from "react";

interface AvatarEditorProps {
  currentAvatarUrl?: string;
  onClose: () => void;
  onSave: (newUrl: string) => void;
}

type AvatarOptions = {
  [key: string]: string[] | number;
  head: string[];
  face: string[];
  body: string[];
  facialHair: string[];
  accessories: string[];
  mask: string[];
  skinColor: string[];
  clothingColor: string[];
  headContrastColor: string[];
  backgroundColor: string[];
  accessoriesProbability: number;
  facialHairProbability: number;
  maskProbability: number;
};

type CategoryConfig = {
  icon: ComponentType<{ className?: string }>;
  label: string;
  options: string[];
  isColor?: boolean;
};

type CategoryKey =
  | "head"
  | "face"
  | "facialHair"
  | "accessories"
  | "mask"
  | "colors";

const COLORS = {
  skinColor: {
    label: "Skin Tone",
    palette: ["ffdbb4", "edb98a", "d08b5b", "ae5d29", "694d3d"],
  },
  clothingColor: {
    label: "Clothing",
    palette: [
      "e78276",
      "ffcf77",
      "fdea6b",
      "78e185",
      "9ddadb",
      "8fa7df",
      "e279c7",
    ],
  },
  headContrastColor: {
    label: "Hair Color",
    palette: [
      "2c1b18",
      "e8e1e1",
      "ecdcbf",
      "d6b370",
      "f59797",
      "b58143",
      "a55728",
      "724133",
      "4a312c",
      "c93305",
    ],
  },
};

const CATEGORIES: Record<CategoryKey, CategoryConfig> = {
  head: {
    icon: User,
    label: "Hair",
    options: [
      "afro",
      "bangs",
      "bangs2",
      "bantuKnots",
      "bear",
      "bun",
      "bun2",
      "buns",
      "cornrows",
      "cornrows2",
      "dreads1",
      "dreads2",
      "flatTop",
      "flatTopLong",
      "grayBun",
      "grayMedium",
      "grayShort",
      "hatBeanie",
      "hatHip",
      "hijab",
      "long",
      "longAfro",
      "longBangs",
      "longCurly",
      "medium1",
      "medium2",
      "medium3",
      "mediumBangs",
      "mediumBangs2",
      "mediumBangs3",
      "mediumStraight",
      "mohawk",
      "mohawk2",
      "noHair1",
      "noHair2",
      "noHair3",
      "pomp",
      "shaved1",
      "shaved2",
      "shaved3",
      "short1",
      "short2",
      "short3",
      "short4",
      "short5",
      "turban",
      "twists",
      "twists2",
    ],
  },
  face: {
    icon: Smile,
    label: "Face",
    options: [
      "angryWithFang",
      "awe",
      "blank",
      "calm",
      "cheeky",
      "concerned",
      "concernedFear",
      "contempt",
      "cute",
      "cyclops",
      "driven",
      "eatingHappy",
      "explaining",
      "eyesClosed",
      "fear",
      "hectic",
      "lovingGrin1",
      "lovingGrin2",
      "monster",
      "old",
      "rage",
      "serious",
      "smile",
      "smileBig",
      "smileLOL",
      "smileTeethGap",
      "solemn",
      "suspicious",
      "tired",
      "veryAngry",
    ],
  },
  facialHair: {
    icon: Scissors,
    label: "Beard",
    options: [
      "none",
      "chin",
      "full",
      "full2",
      "full3",
      "full4",
      "goatee1",
      "goatee2",
      "moustache1",
      "moustache2",
      "moustache3",
      "moustache4",
      "moustache5",
      "moustache6",
      "moustache7",
      "moustache8",
      "moustache9",
    ],
  },
  accessories: {
    icon: Sun,
    label: "Acc.",
    options: [
      "none",
      "eyepatch",
      "glasses",
      "glasses2",
      "glasses3",
      "glasses4",
      "glasses5",
      "sunglasses",
      "sunglasses2",
    ],
  },
  mask: {
    icon: Shield,
    label: "Mask",
    options: ["none", "medicalMask", "respirator"],
  },
  colors: {
    icon: Palette,
    label: "Colors",
    options: [],
    isColor: true,
  },
};

export default function AvatarEditor({
  currentAvatarUrl: _currentAvatarUrl,
  onClose,
  onSave,
}: AvatarEditorProps) {
  const [activeTab, setActiveTab] = useState<CategoryKey>("head");
  const [options, setOptions] = useState<AvatarOptions>({
    head: ["afro"],
    face: ["smile"],
    body: ["chest"],
    facialHair: [],
    accessories: [],
    mask: [],
    skinColor: ["ffdbb4"],
    clothingColor: ["e78276"],
    headContrastColor: ["2c1b18"],
    backgroundColor: ["b6e3f4"],
    accessoriesProbability: 100,
    facialHairProbability: 100,
    maskProbability: 100,
  });
  const [saving, setSaving] = useState(false);
  const supabase = createClient();
  void _currentAvatarUrl;

  // Generate the avatar
  const avatar = useMemo(() => {
    return createAvatar(openPeeps, {
      ...options,
    } as Parameters<typeof createAvatar>[1]);
  }, [options]);

  const optionPreviews = useMemo(() => {
    if (activeTab === "colors") return {};

    const baseConfig = { ...options };
    const previews: Record<string, string> = {};

    CATEGORIES[activeTab]?.options?.forEach((option: string) => {
      const value = option === "none" ? [] : [option];
      const avatarConfig = { ...baseConfig, [activeTab]: value };
      const previewAvatar = createAvatar(
        openPeeps,
        avatarConfig as Parameters<typeof createAvatar>[1]
      );
      previews[option] = previewAvatar.toDataUri();
    });

    return previews;
  }, [activeTab, options]);

  const dataUri = avatar.toDataUri();
  const [previewSrc, setPreviewSrc] = useState<string>(
    _currentAvatarUrl ?? dataUri
  );
  const [hasEdited, setHasEdited] = useState(false);

  useEffect(() => {
    if (!hasEdited) {
      setPreviewSrc(_currentAvatarUrl ?? dataUri);
    }
  }, [_currentAvatarUrl, dataUri, hasEdited]);

  useEffect(() => {
    if (hasEdited) {
      setPreviewSrc(dataUri);
    }
  }, [dataUri, hasEdited]);

  const handleRandomize = () => {
    const getRandom = <T,>(arr: T[]) =>
      arr[Math.floor(Math.random() * arr.length)];
    setHasEdited(true);
    setOptions({
      head: [getRandom(CATEGORIES.head.options)],
      face: [getRandom(CATEGORIES.face.options)],
      body: ["chest"],
      facialHair:
        Math.random() > 0.5
          ? [
              getRandom(
                CATEGORIES.facialHair.options.filter((o) => o !== "none")
              ),
            ]
          : [],
      accessories:
        Math.random() > 0.5
          ? [
              getRandom(
                CATEGORIES.accessories.options.filter((o) => o !== "none")
              ),
            ]
          : [],
      mask:
        Math.random() > 0.9
          ? [getRandom(CATEGORIES.mask.options.filter((o) => o !== "none"))]
          : [],
      skinColor: [getRandom(COLORS.skinColor.palette)],
      clothingColor: [getRandom(COLORS.clothingColor.palette)],
      headContrastColor: [getRandom(COLORS.headContrastColor.palette)],
      backgroundColor: [
        getRandom(["b6e3f4", "c0aede", "d1d4f9", "ffd5dc", "ffdfbf"]),
      ],
      accessoriesProbability: 100,
      facialHairProbability: 100,
      maskProbability: 100,
    });
  };

  const handleOptionClick = (
    category: Exclude<CategoryKey, "colors">,
    value: string
  ) => {
    setHasEdited(true);
    setOptions((prev) => ({
      ...prev,
      [category]: value === "none" ? [] : [value],
    }));
  };

  const handleColorClick = (type: keyof typeof COLORS, color: string) => {
    setHasEdited(true);
    setOptions((prev) => ({
      ...prev,
      [type]: [color],
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not found");

      const svgString = avatar.toString();
      const blob = new Blob([svgString], { type: "image/svg+xml" });
      const fileName = `${user.id}-${Date.now()}.svg`;

      const { error: uploadError } = await supabase.storage
        .from("profile_pic")
        .upload(fileName, blob, {
          contentType: "image/svg+xml",
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("profile_pic").getPublicUrl(fileName);

      const response = await fetch("/api/profile/avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarUrl: publicUrl }),
      });

      if (!response.ok) throw new Error("Failed to update profile");

      onSave(publicUrl);
      onClose();
    } catch (error) {
      console.error("Error saving avatar:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-background border border-foreground/10 rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col md:flex-row h-[600px] md:h-[650px]">
        {/* Left Side: Preview */}
        <div className="md:w-2/5 p-8 flex flex-col items-center justify-center bg-foreground/5 border-b md:border-b-0 md:border-r border-foreground/5">
          <div className="relative w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden ring-4 ring-red-500/20 shadow-2xl bg-[#1a1a1a] mb-8">
            <Image
              src={previewSrc}
              alt="Avatar Preview"
              fill
              className="object-cover"
              unoptimized
            />
          </div>
          <Button
            variant="ghost"
            onClick={handleRandomize}
            className="text-muted-foreground hover:text-foreground hover:bg-foreground/5"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Randomize Look
          </Button>
        </div>

        {/* Right Side: Customization */}
        <div className="md:w-3/5 flex flex-col">
          {/* Tabs */}
          <div className="flex items-center overflow-auto">

          <div className="flex items-center border-b border-foreground/5 p-2 bg-background/5 gap-2 overflow-x-auto scrollbar-hide">
            {Object.entries(CATEGORIES).map(([id, cat]) => (
              <button
              key={id}
              onClick={() => setActiveTab(id as CategoryKey)}
              className={`flex-shrink-0 flex flex-col items-center py-2 px-4 rounded-xl transition-all ${
                activeTab === id
                ? "bg-red-600 text-white shadow-lg"
                : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
              }`}
              >
                <cat.icon className="h-4 w-4 mb-1" />
                <span className="text-[10px] uppercase font-bold tracking-wider">
                  {cat.label}
                </span>
              </button>
            ))}
            </div>
            <button
              onClick={onClose}
              className="px-4 ml-auto text-muted-foreground hover:text-foreground"
            >
              <X size={20} />
            </button>
          </div>

          {/* Options Grid */}
          <div className="flex-1 overflow-y-auto p-6 scrollbar-hide bg-background">
            {activeTab === "colors" ? (
              <div className="space-y-8">
                {Object.entries(COLORS).map(([key, config]) => {
                  const colorKey = key as keyof typeof COLORS;
                  const currentSelection = options[colorKey] as string[];

                  return (
                    <div key={colorKey}>
                      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">
                        {config.label}
                      </h4>
                      <div className="flex flex-wrap gap-3">
                        {config.palette.map((color) => (
                          <button
                            key={color}
                            onClick={() => handleColorClick(colorKey, color)}
                            className={`w-10 h-10 rounded-full border-2 transition-all hover:scale-110 ${
                              currentSelection[0] === color
                                ? "border-foreground scale-110"
                                : "border-transparent"
                            }`}
                            style={{ backgroundColor: `#${color}` }}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {CATEGORIES[activeTab].options?.map((option: string) => {
                  const isSelected =
                    options[activeTab].length === 0
                      ? option === "none"
                      : options[activeTab][0] === option;

                  return (
                    <button
                      key={option}
                      onClick={() => handleOptionClick(activeTab, option)}
                      className={`px-3 py-3 rounded-2xl text-[13px] font-medium transition-all text-center capitalize overflow-hidden truncate flex flex-col items-center gap-2 ${
                        isSelected
                          ? "bg-red-600/20 text-red-500 border border-red-500/40"
                          : "bg-foreground/5 text-muted-foreground border border-transparent hover:border-foreground/10 hover:bg-foreground/10"
                      }`}
                    >
                      {optionPreviews[option] && (
                        <span className="relative w-14 h-14 rounded-full overflow-hidden bg-[#1a1a1a] border border-foreground/10">
                          <Image
                            src={optionPreviews[option]}
                            alt={`${option} preview`}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </span>
                      )}
                      <span className="truncate">
                        {option === "none"
                          ? "None"
                          : option.replace(/([A-Z])/g, " $1").trim()}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-foreground/5 bg-foreground/5">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full h-12 bg-red-600 hover:bg-red-700 text-foreground font-bold rounded-2xl transition-all shadow-xl shadow-red-900/20"
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />
                  Saving Your Avatar...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Apply Changes
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
