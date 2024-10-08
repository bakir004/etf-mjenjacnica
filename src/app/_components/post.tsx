"use client";
import { Button } from "~/components/ui/button";

import { api } from "~/trpc/react";
import { PostForm } from "./postform";

export function LatestPost() {
  // const [latestPost] = api.post.getLatest.useSuspenseQuery();

  // const utils = api.useUtils();
  // const deletePost = api.post.deleteLatest.useMutation({
  //   onSuccess: async () => {
  //     await utils.post.invalidate();
  //   },
  // });

  return (
    <div className="w-full max-w-xs">
      {/* {latestPost ? (
        <p className="truncate">Your most recent post: {latestPost.name}</p>
      ) : (
        <p>You have no posts yet.</p>
      )}
      <PostForm></PostForm>
      <Button disabled={deletePost.isPending}>
        {deletePost.isPending ? "Deleting..." : "Delete"}
      </Button> */}
    </div>
  );
}
