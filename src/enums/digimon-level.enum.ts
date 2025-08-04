import { enumUnserializer } from "../helper/enum.helper";

enum DigimonLevel {
  BabyI = "Baby I",
  BabyII = "Baby II",
  Child = "Child",
  Adult = "Adult",
  Perfect = "Perfect",
  Ultimate = "Ultimate",

  Armor = "Armor",
  Hybrid = "Hybrid",
  NoLevel = "No Level",
  Unknown = "Unknown",
}

export const digimonLevelSerializer: Record<DigimonLevel, string> = {
  [DigimonLevel.BabyI]: "baby1",
  [DigimonLevel.BabyII]: "baby2",
  [DigimonLevel.Child]: "child",
  [DigimonLevel.Adult]: "adult",
  [DigimonLevel.Perfect]: "perfect",
  [DigimonLevel.Ultimate]: "ultimate",
  [DigimonLevel.Armor]: "armor",
  [DigimonLevel.Hybrid]: "hybrid",
  [DigimonLevel.NoLevel]: "no-level",
  [DigimonLevel.Unknown]: "unknown",
};

export const digimonLevelUnserializer = enumUnserializer(
  digimonLevelSerializer
);

export const allDigimonLevels = [
  DigimonLevel.BabyI,
  DigimonLevel.BabyII,
  DigimonLevel.Child,
  DigimonLevel.Adult,
  DigimonLevel.Perfect,
  DigimonLevel.Ultimate,
  DigimonLevel.Armor,
  DigimonLevel.Hybrid,
  DigimonLevel.NoLevel,
  DigimonLevel.Unknown,
];

export default DigimonLevel;
