
"use client";

import { ICard } from "@/lib/api";
import { CARD_SHOW_PATH, getPageURL } from "@/lib/paths";
import { supabase } from "@/lib/supabase/supabaseClient";
import {
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import moment from "moment";
import Link from "next/link";
import { useState } from "react";
import useClipboardApi from "use-clipboard-api";
import { v4 as uuidv4 } from "uuid"; //will need
import CommentBox from "./CommentBoxes";




const MAX_CHARACTERS_PREVIEW = 300;

const LOADING_MESSAGES = [
  "Processing your request...",
  "About 30 seconds remaining...",
  "Processing your request...",
  "About 25 seconds remaining...",
  "About 25 seconds remaining...",
  "Processing your request...",
  "About 20 seconds remaining...",
  "About 20 seconds remaining...",
  "Processing your request...",
  "Processing your request...",
  "About 15 seconds remaining...",
  "About 15 seconds remaining...",
  "Processing your request...",
  "About 10 seconds remaining...",
  "About 10 seconds remaining...",
  "Hang tight...",
  "Hang tight...",
  "Hang tight...",
  "About 5 seconds remaining...",
  "About 5 seconds remaining...",
  "Finishing up...",
];

const WAIT_MS = 2500;
const POLL_INTERVAL = 10000;

type SupabaseRealtimePayload<T = any> = {
  old: T;
  new: T;
};


// IDEA: Use similar system to the likes to format the choice

function hasLikedCardBefore(cardId?: string): boolean {
  if (!cardId || typeof window === "undefined") {
    return false;
  }
  const likedCards = JSON.parse(localStorage.getItem("likedCards") || "[]");
  return likedCards.includes(cardId);
}

function markCardAsLiked(cardId: string) {
  const likedCards = JSON.parse(localStorage.getItem("likedCards") || "[]");
  likedCards.push(cardId);
  localStorage.setItem("likedCards", JSON.stringify(likedCards));
}



export default function ThreeCardLayout({ cards, userName }: { cards: ICard, userName: string }) {

  const [msgIndex, setMsgIndex] = useState<number>(0);
  const isLoading = !cards.responses || cards.responses.length <= 0;
  const [value, copy] = useClipboardApi();
  const currentUrl = getPageURL(`${CARD_SHOW_PATH}/${cards.id}`);
  const [recentlyCopied, setRecentlyCopied] = useState(false);
  const [prettyCreatedAt, setPrettyCreatedAt] = useState(
    !!cards.created_at && new Date(cards.created_at) < new Date()
      ? moment(cards.created_at).fromNow()
      : moment().fromNow()
  );

  //Function that sends comments to supabase under respective card.comment
  const submitCommentFeedback = async ({
    comment,
    card
  }: {
    comment: string;
    card: ICard;
  }) => {
    try {
      
      
      const { data: existingCard, error: fetchError } = await supabase
        .from("cards")
        .select("question_id, response_id")
        .eq("id", card.id)
        .single();

      if (fetchError) {
        throw fetchError;
      }
      console.log(existingCard)

      // const newFeedbackId = uuidv4();
      const user_id = `${userName}_${Date.now()}`;

      // const newComment = { comment: comment };

      // const existingComment = 
      //   existingCard.comment && Array.isArray(existingCard.comment)
      //     ? existingCard.comment
      //     : [];
      // const updatedComment = [...existingComment, newComment];
    
      // const { data, error } = await supabase
      //   .from("UserFeedback")

        // .update({ comment: updatedComment })
        // .eq("id", card.id)
        // .select()

      const { data, error } = await supabase
      .from("UserFeedback")
      .insert([
        { question_id: existingCard.question_id, response_id: existingCard.response_id, user_id: user_id, comment: comment},
      ])
      .select()
        
      if (error) {
        throw error;
      }
    } catch (error) {}
  };

  return (
    <div>
 
      <div className="flex justify-center mt-10 space-x-4-x">
        {cards && cards.map((card, index) => (
          <div key={index} className={`my-6 rounded-lg bg-blue p-6 text-primary`}>
            <Link href={`${CARD_SHOW_PATH}/${card.id}`}>
              <div>
                <h4 className="text-xl font-bold">{card.title}</h4>
                <h6 className="text-xs">
                  <span className="text-purple">
                    {card.is_mine ? "You | " : null}
                  </span>
                </h6>

                  <p className="my-5">
                    {card.responses[0].response}
                    {/* {card.responses[0].response.length > MAX_CHARACTERS_PREVIEW
                      ? "..."
                      : null} */}
                  </p>
              </div>
            </Link>
          <CommentBox
            card = {card}
            onSubmit={submitCommentFeedback}
          />
          </div>
        ))
        }

      </div>

    </div>
  );
}