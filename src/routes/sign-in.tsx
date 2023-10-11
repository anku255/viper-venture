import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import {
  useSupabaseClient,
  useSessionContext,
} from "@supabase/auth-helpers-react";
import { useNavigate } from "react-router-dom";

const typography = {
  fontFamily: "'Special Elite', cursive",
  fontSize: "1.1rem",
};

const authStyles = {
  input: {
    ...typography,
    color: "white",
  },
  label: typography,
  message: typography,
  button: typography,
  anchor: typography,
};

export function SignInPage() {
  const client = useSupabaseClient();
  const { isLoading, session } = useSessionContext();
  const navigate = useNavigate();

  if (isLoading) {
    return null;
  }

  if (session) {
    navigate("/game");
    return null;
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center w-screen h-screen">
        <div className="mx-auto w-400 ">
          <Auth
            supabaseClient={client}
            appearance={{
              theme: ThemeSupa,
              style: authStyles,
            }}
            providers={[]}
          />
        </div>
      </div>
    );
  }
}
