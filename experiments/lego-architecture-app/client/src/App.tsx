import { Refine } from "@refinedev/core";
import { dataProvider } from "./providers/data-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { trpc } from "./providers/trpc";
import { httpBatchLink } from "@trpc/client";
import { useState } from "react";
import { BrowserRouter, Routes, Route, Outlet, Link } from "react-router-dom";
import routerBindings, { NavigateToResource, UnsavedChangesNotifier, DocumentTitleHandler } from "@refinedev/react-router-v6";

import { DynamicList } from "./components/DynamicList";
import { AutoForm } from "./components/AutoForm";

const Layout = () => (
  <div className="min-h-screen bg-gray-50 flex flex-col">
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="text-xl font-bold text-gray-900 tracking-tight">
            Lego Architecture
          </Link>
          <nav className="flex gap-4">
            <Link to="/items" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              Items
            </Link>
            <Link to="/policies" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              Policies
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          {/* User Profile or Actions */}
          <div className="h-8 w-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-bold text-xs">
            A
          </div>
        </div>
      </div>
    </header>
    <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Outlet />
    </main>
  </div>
);

function App() {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: "http://localhost:3000/trpc",
        }),
      ],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Refine
            dataProvider={dataProvider}
            routerProvider={routerBindings}
            resources={[
              {
                name: "items",
                list: "/items",
                create: "/items/create",
                edit: "/items/edit/:id",
                show: "/items/show/:id",
              },
            ]}
            options={{
              syncWithLocation: true,
              warnWhenUnsavedChanges: true,
            }}
          >
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<NavigateToResource resource="items" />} />
                <Route path="/items">
                  <Route index element={<DynamicList />} />
                  <Route path="create" element={<AutoForm />} />
                  <Route path="edit/:id" element={<AutoForm />} />
                  <Route path="show/:id" element={<div>Show Item (TODO)</div>} />
                </Route>
              </Route>
            </Routes>
            <UnsavedChangesNotifier />
            <DocumentTitleHandler />
          </Refine>
        </BrowserRouter>
      </QueryClientProvider>
    </trpc.Provider>
  );
}

export default App;
