# Run Xhine on your friend's computer

Xhine runs in a web browser with a small local development server. No API keys, database, or environment file are required.

## 1. Give your friend access

The repository is private: https://github.com/cinexofficial/xhine.

As the owner, open the repository on GitHub, choose **Settings → Collaborators → Add people**, and invite your friend's GitHub username. Your friend must accept the invitation and use their own account to download or clone it. Do not share your password.

## 2. Install the tools on their computer

1. Install **Node.js 24** from https://nodejs.org/en/download. The installer includes npm.
2. Install **Git** from https://git-scm.com/downloads.
3. Open a new **Command Prompt** after installation. Run:

```bat
node --version
npm --version
git --version
npm install --global pnpm@11.25.0
pnpm --version
```

Node should report `v24.x`; pnpm should report `11.25.0`.

## 3. Download and start the site

In Command Prompt, go to the folder where you want to keep the project, then run:

```bat
git clone https://github.com/cinexofficial/xhine.git
cd xhine
pnpm install --frozen-lockfile
pnpm dev
```

If Git asks you to sign in, use the friend's GitHub account that accepted the invitation. The dependency download needs an internet connection.

Open **http://127.0.0.1:5173** in a browser. If the terminal prints a different Local URL because that port is occupied, open the printed URL instead.

Keep Command Prompt open while using the site. Press **Ctrl+C** to stop it. Next time, open a terminal inside the `xhine` folder and run `pnpm dev` again. You only need to install dependencies again when they change.

### Download ZIP instead of using Git

While signed in to GitHub, open the repository and choose **Code → Download ZIP**. Extract the ZIP, open Command Prompt in the extracted folder containing `package.json`, then run:

```bat
pnpm install --frozen-lockfile
pnpm dev
```

Do not double-click `index.html`; start the server and use the printed URL.

## 4. Get future changes

For a Git clone, stop the server and run these commands inside the project folder when you have no uncommitted local edits:

```bat
git pull --ff-only
pnpm install --frozen-lockfile
pnpm dev
```

For a ZIP download, download and extract a fresh copy instead. Git transfers code; it does not transfer browser demo data.

## Let a friend view the site over the same Wi-Fi

This option runs the server on your computer, so your friend only needs a browser. Connect both computers to the same trusted local network.

1. Stop any existing development server with **Ctrl+C**.
2. In your project folder, run:

```bat
pnpm dev --host 0.0.0.0 --port 5173 --strictPort
```

3. Send your friend the **Network** URL printed by Vite, such as `http://192.168.1.20:5173`. They must use your computer's network address; `localhost` on their computer points to their own computer.
4. Keep your computer awake and the terminal open. If Windows asks about Node.js network access, allow it for your trusted **private network**. Guest Wi-Fi or network isolation may prevent devices from reaching each other.

If Vite reports that port 5173 is occupied, stop the other server or choose another port and use that port in the URL. This Wi-Fi method requires both devices to be on the same reachable network. To run the app in a different location, use the clone or ZIP instructions above.

## What your friend will see

Your friend gets the working demo with sample student and teacher accounts. Use the **Demo** account switcher to explore both roles. Data is saved in each browser's local storage. Assignments or tasks created in your browser will not appear on your friend's computer, even when you both use the same Wi-Fi preview. Real shared accounts and cross-device updates require a backend.

## Troubleshooting

| Problem | What to do |
| --- | --- |
| `node`, `npm`, `git`, or `pnpm` is not recognized | Finish installing the relevant tool, then close and reopen Command Prompt. |
| `Repository not found` | Accept the private repository invitation and authenticate with the invited GitHub account. |
| Missing `package.json` | Open the terminal in the project folder containing that file. |
| Dependency installation fails | Check internet access, Node 24, and pnpm 11.25.0. Keep the lockfile and retry `pnpm install --frozen-lockfile`. |
| Browser cannot connect | Keep the development server running and use the exact URL printed in its terminal. |
| A PowerShell script execution error appears | Use **Command Prompt** for the commands in this guide. |

To check a production build locally:

```bat
pnpm build
pnpm preview
```

Open the preview URL printed in the terminal, usually `http://127.0.0.1:4173`.
