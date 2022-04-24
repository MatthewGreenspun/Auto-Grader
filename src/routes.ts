import express from "express";
import { google } from "googleapis";
import { scopes, getAuthenticatedClient, FullCourseData } from "./utils";
const router = express.Router();

const characterQuizWorkId = "500517013513";
const testClassId = "281443659576";

router.get("/", async (req, res) => {
  const oAuth2Client = await getAuthenticatedClient();
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
  });
  res.render("pages/index", { authUrl });
});

router.get("/auth", async (req, res) => {
  const oAuth2Client = await getAuthenticatedClient();
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
  });
  res.redirect(authUrl);
});

router.get("/callback", async (req, res) => {
  const code = req.query.code;
  await getAuthenticatedClient(code as string);
  console.log("code: ", code);
  res.redirect("/courses");
});

router.get("/courses", async (req, res) => {
  try {
    const oAuth2Client = await getAuthenticatedClient();
    const classroom = google.classroom({ version: "v1", auth: oAuth2Client });

    const {
      data: { courses },
    } = await classroom.courses.list({});
    //TODO: if courses are undefined

    const fullCourseData: FullCourseData[] = [];
    for (let course of courses!) {
      const {
        data: { teachers },
      } = await classroom.courses.teachers.list({ courseId: course.id });
      if (teachers && teachers.length > 0)
        fullCourseData.push({ ...course, teacher: teachers[0] });
    }
    console.log(JSON.stringify(fullCourseData, null, 4));
    res.render("pages/courses", { courses: fullCourseData });
  } catch (err) {
    console.log("\n\nerror getting courses\n\n");
    console.error(err);
    // res.redirect("/auth");
    res.send(err);
  }

  // const submissionsRes =
  //   await classroom.courses.courseWork.studentSubmissions.list({
  //     courseId: testClassId,
  //     courseWorkId: characterQuizWorkId,
  //   });
  // const submissions = submissionsRes.data;
  // console.log(submissions);

  // const quizSubmissionAttachment =
  //   submissions.studentSubmissions![0].assignmentSubmission?.attachments![0]
  //     .driveFile;
  // const drive = google.drive({ version: "v3", auth: oAuth2Client });
  // let image: Buffer;
  // drive.files
  //   .get(
  //     {
  //       fileId: quizSubmissionAttachment?.id,
  //       alt: "media",
  //     },
  //     { responseType: "stream" }
  //   )
  //   .then((fileRes) => {
  //     const chunkArray: Buffer[] = [];
  //     fileRes.data
  //       .on("data", (chunk: Buffer) => {
  //         chunkArray.push(chunk);
  //       })
  //       .on("end", () => {
  //         console.log("Done downloading file.");
  //         image = Buffer.concat(chunkArray);

  //         res.send(`
  //           <link rel="preconnect" href="https://fonts.gstatic.com">
  //           <link href="https://fonts.googleapis.com/css2?family=Roboto&display=swap" rel="stylesheet">
  //           <style>
  //             *{font-family: 'Roboto', 'sans-serif';}
  //           </style>
  //           <a href="/">home</a>
  //           <h1>Your Courses: </h1>
  //           <div style="display: flex; flex-wrap: wrap; font-family: 'Roboto', 'sans-serif';">
  //           ${courses
  //             ?.map(
  //               ({
  //                 name,
  //                 section,
  //                 descriptionHeading,
  //                 description,
  //                 alternateLink,
  //                 id,
  //               }) => {
  //                 return `
  //                 <div style="margin: 5px; padding: 5px; border: 3px solid gray; border-radius: 4px; width: 100%">
  //                   <h2>${name}</h2>
  //                   <hr>
  //                   <h5>${section ?? ""}</h5>
  //                   <h5>id: ${id ?? ""}</h5>
  //                   <h5>${descriptionHeading ?? ""}</h5>
  //                   <h5>${description ?? ""}</h5>
  //                   <a href="${alternateLink}">Go To Class</a>
  //                   <hr>
  //                 </div>
  //               `;
  //               }
  //             )
  //             .toString()
  //             .replace(/,/g, "<br>")}
  //           </div>

  //           <img src=${"data:image/png;base64," + image.toString("base64")}>
  //         `);
  //       })
  //       .on("error", (err) => {
  //         console.error("Error downloading file.");
  //       });
  //     // .pipe(dest);
  //   });
});

export default router;
