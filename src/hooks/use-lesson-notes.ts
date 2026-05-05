import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useLessonNotes(userId: string | undefined, lessonId: string | undefined) {
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!userId || !lessonId) return;
    setLoaded(false);
    supabase
      .from("lesson_notes")
      .select("content")
      .eq("user_id", userId)
      .eq("lesson_id", lessonId)
      .single()
      .then(({ data }) => {
        setContent(data?.content ?? "");
        setLoaded(true);
      });
  }, [userId, lessonId]);

  const save = useCallback(async (text: string) => {
    if (!userId || !lessonId) return;
    setSaving(true);
    await supabase.from("lesson_notes").upsert(
      { user_id: userId, lesson_id: lessonId, content: text },
      { onConflict: "user_id,lesson_id" }
    );
    setSaving(false);
  }, [userId, lessonId]);

  const updateContent = useCallback((text: string) => {
    setContent(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => save(text), 1000);
  }, [save]);

  return { content, updateContent, saving, loaded };
}
