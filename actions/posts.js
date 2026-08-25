
"use server";

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { storePost } from '@/lib/posts';
import { uploadImage } from '@/lib/cloudinary';

import { updatePostLikeStatus } from '@/lib/posts'

export async function createPost(prevState, formData) {
  const title = formData.get('title')
  const image = formData.get('image')
  const content = formData.get('content')

  let errors = [];

  if(!title || title.trim().length === 0) {
    errors.push("title is required")
  }
  if(!content || content.trim().length === 0) {
    errors.push("content is required")
  }
  if(!image || image.size === 0) {
    errors.push("image is required")
  }
  
  let imageUrl;

  if(errors.length > 0) {
    return { errors };
  }

  try {
    imageUrl = await uploadImage(image);
  } catch(error) {
    throw new Error('Image upload failed, post was not created. Please try again later.')
  }

  await storePost({
    imageUrl: imageUrl,
    title,
    content,
    userId: 1
  })

  redirect('/feed');
}

export async function togglePostLikeStatus(postId) {
  await updatePostLikeStatus(postId, 2)

  // like re-rendered after above function done..
  revalidatePath('/feed', 'layout');
}
