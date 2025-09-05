import type { InferHandler } from "elysia";
import type serverService from "../services/server.service";
import DigimonLevel, {
  allDigimonLevels,
  digimonLevelUnserializer,
} from "../enums/digimon-level.enum";
import digimonService from "../services/digimon.service";

type DigimonsHandler = InferHandler<typeof serverService.server, "/digimons">;

export const digimonsResolver: DigimonsHandler = async ({ query }) => {
  const {
    levels: levelsParam,
    take: takeParam,
    offset: offsetParam,
    name: nameParam,
  } = query;

  const take = takeParam ? Number(takeParam) : 10;
  const offset = offsetParam ? Number(offsetParam) : 0;

  const levels = levelsParam
    ?.split(",")
    .map((level) => digimonLevelUnserializer[level.trim().toLowerCase()])
    .filter(Boolean) as DigimonLevel[] | undefined;

  const digimons = await digimonService.getDigimons({
    filters: { levels, name: nameParam },
    take,
    offset,
  });

  return digimons;
};
