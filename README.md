This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


Icons:

To add an icon
- Add icon to respective folder in components/icons/custom/[sectionname]-icons
- Add to index.ts in components/icons/custom/[sectionname]-icons
- Add to utils/iconConfig.ts in respective section


Current setup to determine the colors and status of things:

Tasks
- First is to review the forced_completion_status in the tasks table. That overrides anything else
- If not forced complete, then it defaults to the (today - date completed) / frequency. That percentage is then compared to the DEFAULT_THRESHOLDS in the taskstatus.ts file

Area
- The area status is set in the areastatus.ts file. It is calculated by (task status * TASK_STATUS_WEIGHT) / (total tasks). Then that percentage is compared to the DEFAULT_AREA_THRESHOLDS, and when it exceeds a threshold that sets the status

Room
- Handled similarly to Area, except instead of comparing the Task weights it's the area weights. This is done in roomstatus.ts



