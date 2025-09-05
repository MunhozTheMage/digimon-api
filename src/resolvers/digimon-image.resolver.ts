import type { InferHandler } from "elysia";
import type serverService from "../services/server.service";
import digimonService from "../services/digimon.service";

type DigimonImageHandler = InferHandler<
  typeof serverService.server,
  "/digimons/:name/image",
  {
    params: {
      name: string;
    };
  }
>;

export const digimonImageResolver: DigimonImageHandler = async ({ params }) => {
  const { name } = params;
  const image = await digimonService.getImage(name);
  return image;
};
