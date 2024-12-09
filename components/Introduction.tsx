import Link from "next/link";

const Introduction = () => {
  return (
    <div className="w-full flex flex-col items-center justify-center gap-4">
      <p className="w-full text-left">
        This is a training tool for competitive programming, inspired by{" "}
        <Link
          href="https://codeforces.com/blog/entry/136704"
          target="_blank"
          className="text-blue-500 hover:underline"
        >
          this blog post
        </Link>
        . Huge thanks to{" "}
        <Link
          href="https://codeforces.com/profile/pwned"
          target="_blank"
          className="text-blue-500 hover:underline"
        >
          pwned
        </Link>{" "}
        for the idea.
      </p>
      <p className="w-full text-left">
        This tool is developed by{" "}
        <Link
          href="https://codeforces.com/profile/C0ldSmi1e"
          target="_blank"
          className="text-blue-500 hover:underline"
        >
          C0ldSmi1e
        </Link>
        . You can find the source code{" "}
        <Link
          href="https://github.com/C0ldSmi1e/training-tracker"
          target="_blank"
          className="text-blue-500 hover:underline"
        >
          here
        </Link>
        . Any suggestions, bug reports or feature requests are welcome.
      </p>
    </div>
  );
};

export default Introduction;