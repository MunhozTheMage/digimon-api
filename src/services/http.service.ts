const fetchHtml = async (url: string) => {
  const response = await fetch(url);
  const html = await response.text();
  return html;
};

const fetchImage = async (url: string) => {
  const response = await fetch(url);
  const image = await response.arrayBuffer();
  return image;
};

const httpService = {
  fetchHtml,
  fetchImage,
};

export default httpService;
