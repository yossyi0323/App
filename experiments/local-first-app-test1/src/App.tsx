import { useState, useEffect } from "react";
import { PGliteProvider } from "@electric-sql/pglite-react";
import { TaskList } from "./components/TaskList";
import { db } from "./lib/db";
import { schema } from "./lib/schema";

function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        await db.exec(schema);
        setIsReady(true);
      } catch (err) {
        console.error("Failed to initialize schema:", err);
      }
    };
    init();
  }, []);

  if (!isReady) {
    return <div className="flex items-center justify-center min-h-screen">Loading database...</div>;
  }

  return (
    <PGliteProvider db={db}>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
        <TaskList />
      </div>
    </PGliteProvider>
  );
}

export default App;
