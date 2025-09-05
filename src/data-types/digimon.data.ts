import type DigimonLevel from "../enums/digimon-level.enum";

export type Digimon = {
  name: string;
  imageUrl: string;
  levels: DigimonLevel[];
};
