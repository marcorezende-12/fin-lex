import { UserButton } from "@clerk/nextjs";

export default function Home() {
  return (
    <div className="flex h-full items-center justify-center">
      <UserButton />
    </div>
  );
}
