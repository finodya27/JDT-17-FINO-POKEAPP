import React, { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import Layout from "./components/layout";


const Homepage = lazy(() => import("./container/Homepage"));
const PokemonDetail = lazy(() => import("./container/PokemonDetail"));
const MyPokemon = lazy(() => import("./container/MyPokemon"));


const PageSuspense = ({ children }: { children: React.ReactNode }) => (
  <Suspense
    fallback={
      <div className="flex items-center justify-center min-h-[60vh] w-full">
        <div className="relative w-10 h-10 flex items-center justify-center bg-red-500 rounded-full border-4 border-gray-900 shadow-md animate-spin">
          <div className="absolute top-0 left-0 w-full h-[40%] bg-red-500 rounded-t-full" />
          <div className="absolute bottom-0 left-0 w-full h-[40%] bg-white rounded-b-full" />
          <div className="w-full h-0.5 bg-gray-900 z-10" />
          <div className="absolute w-2.5 h-2.5 bg-white border border-gray-900 rounded-full z-20" />
        </div>
      </div>
    }
  >
    {children}
  </Suspense>
);

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: (
          <PageSuspense>
            <Homepage />
          </PageSuspense>
        ),
      },
      {
        path: "pokemon/:name",
        element: (
          <PageSuspense>
            <PokemonDetail />
          </PageSuspense>
        ),
      },
      {
        path: "my-pokemon",
        element: (
          <PageSuspense>
            <MyPokemon />
          </PageSuspense>
        ),
      },
    ],
  },
]);
