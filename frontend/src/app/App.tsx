import { RouterProvider } from "react-router-dom";

import { Providers } from "@/app/providers";
import { router } from "@/app/router";

export function App() {
  return (
    <Providers>
      <RouterProvider future={{ v7_startTransition: true }} router={router} />
    </Providers>
  );
}
