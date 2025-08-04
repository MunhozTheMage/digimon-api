import type { Digimon } from "../data-types/digimon.data";
import DigimonLevel from "../enums/digimon-level.enum";
import { allDigimonLevels } from "../enums/digimon-level.enum";
import htmlService, { type HtmlElement } from "./html.service";
import httpService from "./http.service";
import logService from "./log.service";

type DigimonFilters = {
  levels?: DigimonLevel[];
  name?: string;
};

type GetDigimonsVariables = {
  filters?: DigimonFilters;
  take: number;
  offset: number;
};

const DIGIMON_FILE_PATH = "digimon.json";

const WIKIMON_BASE_URL = "https://wikimon.net";
const WIKIMON_DIGIMON_IMAGE_LIST_URL = `${WIKIMON_BASE_URL}/Visual_List_of_Digimon`;
const WIKIMON_CATEGORY_URL_PREFIX = `${WIKIMON_BASE_URL}/Category:`;

const WIKIMON_IMAGE_LIST_CARD_SELECTOR = `table[style*="width: 130px;"][style*="float: left;"] img`;
const WIKIMON_LIST_DIGIMON_NAMES_SELECTOR = `#content li a`;
const WIKIMON_LIST_PAGE_NAVIGATION_SELECTOR = `a[title^="Category:"]`;

const WIKIMON_LIST_NEXT_PAGE_TEXT = "next page";

// PRIVATE

const readDigimonFile = async (): Promise<Digimon[] | undefined> => {
  try {
    const file = Bun.file(DIGIMON_FILE_PATH);

    if (await file.exists()) {
      logService.info(`Digimon file found`);
      const parsedFile = await file.json();
      return parsedFile as Digimon[];
    }

    logService.warn(`Digimon file not found`);
  } catch (error) {
    logService.error(`Could not read digimon file: ${error}`);
  }
};

const parseDigimonCard = (
  card: HtmlElement
): Pick<Digimon, "imageUrl" | "name"> => {
  const imageSources = card.getAttribute("srcset") ?? card.getAttribute("src");
  const digimonName = card.getAttribute("alt");

  if (!imageSources || !digimonName) {
    const errorMessage = `Digimon card missing required data`;
    logService.error(errorMessage);
    throw new Error(errorMessage);
  }

  const imageUrls = htmlService.parseSrcset(imageSources);
  // Wikimon puts the best image url last
  const bestImageUrl = imageUrls[imageUrls.length - 1]!;

  return {
    name: digimonName,
    imageUrl: bestImageUrl,
  };
};

const getDigimonIndexName = (name: string) =>
  name.toLowerCase().replace(/ /g, "_");

const getDigimonNamesAndImages = async (): Promise<
  Record<string, Pick<Digimon, "imageUrl" | "name">>
> => {
  const digimonImageListHtml = await logService.withTiming(
    () => httpService.fetchHtml(WIKIMON_DIGIMON_IMAGE_LIST_URL),
    "Fetching digimon names and images from Wikimon"
  );

  const imageListParser =
    htmlService.createVirtualDomFromHtml(digimonImageListHtml);

  const digimonCards = htmlService.querySelectorAll(
    imageListParser,
    WIKIMON_IMAGE_LIST_CARD_SELECTOR
  );

  return Object.fromEntries(
    digimonCards.map((card) => {
      const { name, imageUrl } = parseDigimonCard(card);
      return [getDigimonIndexName(name), { name, imageUrl }];
    })
  );
};

const getDigimonNamesFromListPage = async (
  url: string
): Promise<{ names: string[]; nextUrl?: string }> => {
  const digimonLevelListHtml = await logService.withTiming(
    () => httpService.fetchHtml(url),
    `Fetching digimon names from Wikimon stage list`
  );

  const digimonLevelListParser =
    htmlService.createVirtualDomFromHtml(digimonLevelListHtml);

  const digimonNames = htmlService
    .querySelectorAll(
      digimonLevelListParser,
      WIKIMON_LIST_DIGIMON_NAMES_SELECTOR
    )
    .map((element) => element.textContent);

  const nextPageHref = htmlService
    .querySelectorAll(
      digimonLevelListParser,
      WIKIMON_LIST_PAGE_NAVIGATION_SELECTOR
    )
    .find((element) =>
      element.textContent?.includes(WIKIMON_LIST_NEXT_PAGE_TEXT)
    )
    ?.getAttribute("href");

  logService.info(nextPageHref ? `Next page found` : "No next page detected");

  return {
    names: digimonNames,
    nextUrl: nextPageHref ? WIKIMON_BASE_URL + nextPageHref : undefined,
  };
};

// Produces certain imperfect data, but it can easily
// be filtered out using getDigimonNamesAndImages's data
// later on
const getDigimonNamesAndStages = async (): Promise<
  Record<string, DigimonLevel[]>
> => {
  // This implementation makes it so requests are made sequentially.
  // This is not optimal, but it's intentional as to not spam requests
  // to wikimon's server.
  const digimonLevels: Record<string, DigimonLevel[]> = {};

  for (const level of allDigimonLevels) {
    logService.info(`Listing digimon names for level: ${level}`);

    const initialUrl = (() => {
      const normalizedLevelName = level.replace(/ /g, "_");
      const urlSuffix = level.toLowerCase().includes("level") ? "" : "_Level";
      return `${WIKIMON_CATEGORY_URL_PREFIX}${normalizedLevelName}${urlSuffix}`;
    })();

    let nextUrl: string | undefined = initialUrl;
    let pageNumber = 0;

    while (nextUrl) {
      pageNumber++;
      logService.info(`Processing page ${pageNumber} of ${level}`);

      const { names, nextUrl: nextListPageUrl } =
        await getDigimonNamesFromListPage(nextUrl);

      names.forEach((digimonName) => {
        const digimonIndex = getDigimonIndexName(digimonName);
        digimonLevels[digimonIndex] = [
          ...(digimonLevels[digimonIndex] ?? []),
          level,
        ];
      });

      nextUrl = nextListPageUrl;
    }

    logService.info(`Finished listing digimon names for level: ${level}`);
  }

  return digimonLevels;
};

const persistDigimonData = async (digimonData: Digimon[]) => {
  await logService.withTiming(
    () => Bun.write(DIGIMON_FILE_PATH, JSON.stringify(digimonData, null, 2)),
    "Persisting digimon data into a JSON file"
  );
};

const generateDigimonData = async (): Promise<Digimon[]> => {
  // Once more, not using Promise.all as to not spam wikimon's server
  const digimonImageUrls = await getDigimonNamesAndImages();
  const digimonStages = await getDigimonNamesAndStages();

  // The image list has the most trustworthy data, so we'll use it
  // as a base for the digimon data, ensuring that any flawed data
  // from the stage list is filtered out in the process.
  const digimonData = Object.entries(digimonImageUrls).map(
    ([digimonIndex, { imageUrl, name }]) => {
      const levels = digimonStages[digimonIndex] ?? [DigimonLevel.Unknown];

      return {
        name,
        imageUrl,
        levels,
      };
    }
  );

  // Data is stored in a JSON file to avoid having to make requests
  // to wikimon's server. It will only be done again if the file
  // is not found or deleted.
  await persistDigimonData(digimonData);
  return digimonData;
};

const getAllDigimonData = async (): Promise<Digimon[]> => {
  const digimonData = await readDigimonFile();
  if (digimonData) return digimonData;

  const newDigimonData = await generateDigimonData();
  return newDigimonData;
};

// PUBLIC

const getDigimons = async ({ filters, take, offset }: GetDigimonsVariables) => {
  const digimonData = await getAllDigimonData();
  let filteredDigimonData = digimonData;

  if (filters?.levels && filters.levels.length > 0) {
    filteredDigimonData = filteredDigimonData.filter((digimon) =>
      filters.levels!.some((level) => digimon.levels.includes(level))
    );
  }

  if (filters?.name) {
    const normalizeName = (name: string) =>
      name.toLowerCase().replace(/[^a-z0-9]/g, "");

    filteredDigimonData = filteredDigimonData.filter((digimon) =>
      normalizeName(digimon.name).includes(normalizeName(filters.name!))
    );
  }

  return {
    digimons: filteredDigimonData.slice(offset, offset + take),
    total: filteredDigimonData.length,
  };
};

const digimonService = {
  getDigimons,
};

export default digimonService;
