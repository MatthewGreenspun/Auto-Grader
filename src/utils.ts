import { classroom_v1, google } from "googleapis";
import { readFileSync, writeFile } from "fs";

export const scopes = [
  "https://www.googleapis.com/auth/classroom.courses.readonly",
  "https://www.googleapis.com/auth/classroom.coursework.me",
  "https://www.googleapis.com/auth/classroom.coursework.students",
  "https://www.googleapis.com/auth/classroom.student-submissions.students.readonly",
  "https://www.googleapis.com/auth/classroom.rosters.readonly",
  "https://www.googleapis.com/auth/classroom.profile.emails",
  "https://www.googleapis.com/auth/classroom.profile.photos",
  "https://www.googleapis.com/auth/drive.readonly",
];

export async function getAuthenticatedClient(code?: string) {
  const oAuth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    "http://localhost:3000/callback"
  );

  if (code) {
    const { tokens } = await oAuth2Client.getToken(code as string);
    oAuth2Client.setCredentials(tokens);
    writeFile("./refresh_token.txt", tokens.refresh_token ?? "NULL", (err) => {
      if (err) console.error(err);
    });
  } else {
    try {
      const data = readFileSync("./refresh_token.txt", { encoding: "utf-8" });
      console.log("getting refresh token: ", data);
      oAuth2Client.setCredentials({ refresh_token: data });
    } catch (err) {
      console.log("no saved refresh token");
      console.error(err);
      return oAuth2Client;
    }
  }

  return oAuth2Client;
}

//https://stackoverflow.com/questions/49682569/typescript-merge-object-types
type Union<A, B> = {
  [K in keyof (A | B)]: K extends keyof B ? B[K] : A[K];
};

export type FullCourseData = Union<
  classroom_v1.Schema$Course,
  { ["teacher"]: classroom_v1.Schema$Teacher }
>;
