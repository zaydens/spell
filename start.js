import chalk from 'chalk';
import fs from "fs";
import fetch from 'node-fetch';
import readline from 'readline';
import { publicIpv4 } from 'public-ip';

async function sleep(time = 10) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(true), time * 1000);
  });
}

async function checkLicense(token, device) {
  const url = "https://f88group.my.id/api/check_license.php";
  const params = new URLSearchParams({ token, device });
  const response = await fetch(`${url}?${params}`);
  return response.json();
}

async function getAccountLists() {
  var account_lists_content = await fs.readFileSync(
    "account_lists.txt",
    "utf-8"
  );
  var account_lists = account_lists_content.trim().split("\r\n");
  account_lists = account_lists.filter((e) => e?.trim() !== "");

  return account_lists;
}

async function getAccountDetail(account) {
  var get_user = await fetch("https://wapi.spell.club/user", {
    method: "GET",
    headers: {
      Authorization: `tma ${account}`,
    },
  });
  var get_user_response = await get_user.json();

  return get_user_response;
}

async function claimMana(account) {
  var post_claim = await fetch(
    "https://wapi.spell.club/claim?batch_mode=true",
    {
      method: "POST",
      headers: {
        Authorization: `tma ${account}`,
      },
      body: "batch_mode=true",
    }
  );
  var post_claim_response = await post_claim.json();

  return post_claim_response;
}

async function getCurrentIp() {
  try {
    const ip = await publicIpv4();
    return ip;
  } catch (error) {
    console.error('Failed to retrieve IP:', error);
    return null;
  }
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

(async () => {
  const device = await getCurrentIp();
  console.log("Alamat IP saat ini:", device);

  rl.question('Please enter your license key: ', async (token) => {
    const licenseData = await checkLicense(token, device);

    if (!licenseData.status) {
      console.log("License is not valid!");
      rl.close();
      return;
    }
    console.log("License Valid!");

    var account_lists = await getAccountLists();
    const CLAIM_DELAY = 60; // claim delay in minutes

    while (true) {
      console.clear();
      console.log(chalk.green('=============================='));
      console.log('');
      console.log(chalk.yellow('-    Bot Auto Claim Spell    -'));
      console.log(chalk.yellow('-      Author ADFMIDN        -'));
      console.log(chalk.yellow('-      Vip Member Only       -'));
      console.log('');
      console.log(chalk.green('=============================='));

      for (let i in account_lists) {
        var account = account_lists[i];

        try {
          var account_detail = await getAccountDetail(account);
          var address = account_detail?.address;
          var balance = (account_detail?.balance / 1000000)?.toFixed(2);
          console.log(chalk.blue(`[${i}] Address : ${address}`));
          console.log(chalk.blue(`[${i}] Mana Balance : ${balance}`));

          var claim_mana = await claimMana(account);
          if (claim_mana?.id) {
            console.log(chalk.green(`[${i}] Claim Status : ${claim_mana.id}`));
          } else {
            console.log(chalk.red(`[${i}] Claim Status : ${claim_mana.message}`));
          }
        } catch {
          console.log(chalk.red(`[${i}] Invalid Account!`));
        }

        console.log(chalk.green('=============================='));
      }
      
      console.log(chalk.cyan(`[#] Waiting ${CLAIM_DELAY} minutes before continue...`));
      console.log(chalk.green('=============================='));
      await sleep(CLAIM_DELAY * 60);
    }
    rl.close();
  });
})();
