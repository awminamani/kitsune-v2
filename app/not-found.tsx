import Link from "next/link";

export default function NotFound() {
  return (
    <main className="shell section">
      <div className="notice">
        <h3>Page not found</h3>
        <p>The page you are looking for does not exist.</p>
        <Link className="btn btn-solid" href="/">Back to home</Link>
      </div>
    </main>
  );
}
