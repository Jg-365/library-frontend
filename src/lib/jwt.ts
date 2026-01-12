export function getJwtSubject(
  token: string | null | undefined
): string | undefined {
  if (!token) {
    return undefined;
  }

  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) {
      return undefined;
    }

    const base64 = base64Url
      .replace(/-/g, "+")
      .replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(
          (char) =>
            "%" +
            ("00" + char.charCodeAt(0).toString(16)).slice(
              -2
            )
        )
        .join("")
    );
    const decoded = JSON.parse(jsonPayload) as {
      sub?: string;
    };
    return decoded.sub;
  } catch (error) {
    console.error("Erro ao decodificar JWT:", error);
    return undefined;
  }
}
