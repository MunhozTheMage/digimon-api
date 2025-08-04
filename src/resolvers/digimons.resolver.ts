import type { InferHandler } from "elysia";
import type serverService from "../services/server.service";
import DigimonLevel, {
  allDigimonLevels,
  digimonLevelUnserializer,
} from "../enums/digimon-level.enum";
import digimonService from "../services/digimon.service";

type DigimonsHandler = InferHandler<typeof serverService.server, "/digimons">;

export const digimonsResolver: DigimonsHandler = async ({ query }) => {
  const { levels } = query;

  const parsedLevels = levels
    ?.split(",")
    .map((level) => digimonLevelUnserializer[level.trim().toLowerCase()])
    .filter(Boolean) as DigimonLevel[] | undefined;

  const digimons = await digimonService.getDigimons({
    filters: { levels: parsedLevels },
  });

  return digimons;
};
