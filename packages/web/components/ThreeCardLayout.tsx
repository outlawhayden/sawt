"use client";

/*
TODO: 
  - Database schema for user feedback
    - UserIDs?
      - Some identifiers
      - Enter email? Or Name + DeviceID to create unique identifier.
    
  - Next button
    - Refresh 3 new responses to question
  
*/



import { ICard } from "@/lib/api";
import { CARD_SHOW_PATH, getPageURL } from "@/lib/paths";
import { supabase } from "@/lib/supabase/supabaseClient";
import {
  faCheck,
  faShare,
  faSpinner,
  faThumbsUp,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import moment from "moment";
import Link from "next/link";
import { useEffect, useState } from "react";
import useClipboardApi from "use-clipboard-api";
import { useInterval } from "usehooks-ts";
import { v4 as uuidv4 } from "uuid";
import { faComment, faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

import Rubric from '@/components/Rubric';

const criteria = [
  { id: 'criterion1', description: 'Criterion 1 Description' },
  { id: 'criterion2', description: 'Criterion 2 Description' },
  // Add more criteria as needed
];



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


interface CommentBoxProps {
  card: ICard;
  onSubmit: ( data: { comment: string, card: ICard }) => void;
}


function CommentBox({ onSubmit, card }: CommentBoxProps) {
  const [comment, setComment] = useState<string>("");
  const handleSubmit = () => {
    onSubmit( { comment , card});
    setComment("");
  };

  const submitButtonStyle = {
    padding: '10px 20px', 
    fontSize: '16px', 
    color: 'white', 
    backgroundColor: '#007bff', 
    border: 'none', 
    borderRadius: '5px', 
    cursor: 'pointer', 
    outline: 'none',
    marginTop: '20px', 
  };

  return (
        <div className="my-12">
        <div className="relative  block">
         <label htmlFor="comment" className="mb-2 mt-4 block">
         <FontAwesomeIcon
            className="left-2 top-1/2 ml-2 h-[20px] w-[28px] cursor-pointer object-contain"
            icon={faComment}
          />
          Comments:
         </label>
         <textarea
            id="comment"
            className="h-20 w-full rounded border p-2"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add feedback here"
          ></textarea>
        </div>
        <button
          onClick={handleSubmit}
          // className="bg-blue-500 rounded bg-secondary px-4 py-2 text-white"
          style={submitButtonStyle}
        >
          Submit
        </button>
      </div>
  );
}

export default function ThreeCardLayout({ cards }: { cards: ICard }) {

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


  const submitCommentFeedback = async ({
    comment,
    card
  }: {
    comment: string;
    card: ICard;
  }) => {
    try {

      /*
       This commented out code is for if we want to update previous comments. 
       Like if they submit their comment and then realize they want to add more.
      */

      // let { data: cards, error: fetchError } = await supabase
      //   .from("cards")
      //   .select("comment")
      //   .eq("id", card.id)
      //   .single();

      // if (fetchError) {
      //   throw fetchError;
      // }

      // const newFeedbackId = uuidv4();

      // const newComment = { id: newFeedbackId, type: comment };

      // const existingComment = 
      //   existingCard.comment && Array.isArray(existingCard.comment)
      //     ? existingCard.comment
      //     : [];
      // const updatedComment = [...existingComment, newComment];

      const { data, error } = await supabase
        .from("cards")
        .update([{ comment: comment }])
        .eq("id", card.id)
        .select()

      if (error) {
        throw error;
      }
    } catch (error) {}
  };

  return (
    <div className="flex justify-center mt-10 space-x-4-x">
      {cards && cards.map((card, index) => (
        <div key={index} className={`my-6 rounded-lg bg-blue p-6 text-primary border-4 border-blue-500
        `}>
          <Link href={`${CARD_SHOW_PATH}/${card.id}`}>
            <div>
              <h4 className="text-xl font-bold">{card.title}</h4>
              <h6 className="text-xs">
                <span className="text-purple">
                  {card.is_mine ? "You | " : null}
                </span>
                <span className="text-secondary">{prettyCreatedAt}</span>
              </h6>

              {!isLoading && !!card.responses ? (
                <p className="my-5">
                  {card.responses[0].response.substring(0, MAX_CHARACTERS_PREVIEW)}
                  {card.responses[0].response.length > MAX_CHARACTERS_PREVIEW
                    ? "..."
                    : null}
                </p>
              ) : (
                <p className="my-5">
                  <FontAwesomeIcon
                    icon={faSpinner}
                    className="mx-2 h-5 w-5 animate-spin align-middle duration-300"
                  />
                  {LOADING_MESSAGES[msgIndex]}
                </p>
              )}            
            </div>
          </Link>
      <CommentBox
        card = {card}
        onSubmit={submitCommentFeedback}
      />

          <hr></hr>
          <label className="flex justify-center mt-10 space-x-1-x">Rubric</label>
          <Rubric criteria={criteria}/>

        </div>
      ))
      }

    </div>
  );
}
/*
${isLoading ? "border-4  border-blue-500" : ""}

    {card.responses[0].response}


{!isLoading && !!card.responses ? (
                <p className="my-5">
                  {card.responses[0].response.substring(0, MAX_CHARACTERS_PREVIEW)}
                  {card.responses[0].response.length > MAX_CHARACTERS_PREVIEW
                    ? "..."
                    : null}
                </p>
              ) : (
                <p className="my-5">
                  <FontAwesomeIcon
                    icon={faSpinner}
                    className="mx-2 h-5 w-5 animate-spin align-middle duration-300"
                  />
                  {LOADING_MESSAGES[msgIndex]}
                </p>
              )}
*/