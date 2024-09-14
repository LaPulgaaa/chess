import Image from "next/image";
import { redirect } from "next/navigation";
import { Button } from "@repo/ui";
import board from "@/public/dark-mode.jpg";
import Link from "next/link";
import { getServerSession } from "next-auth";


export default async function Home() {
  const session = await getServerSession();

  if(session !== null)
    redirect("/home");
  
  return (
    <div className="flex flex-col lg:flex-row items-center justify-between m-36">
      <div className="flex flex-col justify-between p-12">
          <div className="mb-16 px-12 ">
            <h1 className="scroll-m-20 text-5xl font-extrabold tracking-tight lg:text-7xl">
              <span>Play Chess</span>
              <br/>
              <span>online & with</span>
              <br/>
              <span>your friends.</span>
            </h1>
          </div>
          <div className="flex justify-center">
          <Link href={"/signin"}><Button className="mx-6">Play</Button></Link>
          <Button
          className="mx-6"
          variant={"secondary"}>Watch</Button>
          </div>
      </div>
      <div className="">
        <Image
          src={board}
          loading="lazy"
          alt="Picture of a chess board"
          width={720}
          height={720}
          className="rounded-md "
        />
      </div>
    </div>
  );
}
