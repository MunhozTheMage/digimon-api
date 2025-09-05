const fetchHtml = async (url: string) => {
  const response = await fetch(url);
  const html = await response.text();
  return html;
};

const httpService = {
  fetchHtml,
};

export default httpService;
