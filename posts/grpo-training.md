# Training LLaMA-3-8B on Math Questions

In my [previous blog post](post.html?slug=grpo-loss-function) I shared my understanding of the GRPO loss function. Since then, I’ve been planning to run a small experiment with it.

Before going into the details of my experiment, here is a quick recap of GRPO:
    1. It **doesn't need a separate critic model**, making its memory requirements lower than PPO
    2. In each step it generates G completions for a given prompt and uses **reward functions** (or models) to compute the rewards for each generation. These rewards are then compared relatively to obtain advantage scores.
    3. It incorporates a **KL divergence approximation** term to ensure that the new policy doesn't deviate too far from the reference policy.

I chose math domain since it is way easier to write a reward function for mathematical questions compared to other domains where the answer could be a free text.

In this post I am going to talk about how I did collect a dataset for my experiment, how the training went and the results of the training.

## Dataset Creation

I wanted to avoid using copyrighted questions in my dataset, so I collected free-to-use Açık Öğretim Fakültesi (a type of distance education in Turkey) questions from the Internet. I specifically selected the **Finance Math course** because I work at a bank, and I thought the experience from this project might be useful in the future.

In total, I collected 542 questions. Some of the questions included references to answer choices. I had to manually convert these into open-ended questions. After that I removed all the units and unnecessary characters from the answers so that only digits, commas and dots will be remained.

Before moving on to training, I randomly sampled 100 questions from the dataset to be used as the test dataset.

## Training

I selected [Turkish-LLama-8b-DPO-v0.1](https://huggingface.co/ytu-ce-cosmos/Turkish-Llama-8b-DPO-v0.1) as my base model. This model was released by a research group from Yildiz Technical University called the Cosmos AI Research Group[^1]. I chose this model because, in my experience, its math skills are quite strong, and it is based on LLaMA-3-8B. While Gemma-2 based models have better Turkish language capabilities, I find them less efficient to serve due to their architecture.

[^1]: https://cosmos.yildiz.edu.tr/

### Reward Functions:

I used two reward functions during training, one for checking the format of the answers and another for evaluating their correctness. I grabbed these functions from the Unsloth tutorial notebook which they sourced them from William Brown[^2]

[^2]: https://willcb.com/

1. Format reward function:

```Python
def count_xml(text) -> float:
    count = 0.0
    if text.count("<matematik>\n") == 1:
        count += 0.125
    if text.count("\n</matematik>\n") == 1:
        count += 0.125
    if text.count("\n<cevap>\n") == 1:
        count += 0.125
        count -= len(text.split("\n</cevap>\n")[-1])*0.001
    if text.count("\n</cevap>") == 1:
        count += 0.125
        count -= (len(text.split("\n</cevap>")[-1]) - 1)*0.001
    return count
```

I could have used a stricter format-checking function, but after performing inference with the base model, I noticed that it had no difficulty following the template. Therefore, I decided that a complex reward function was unnecessary.

2. Correctness reward function:
```Python
def extract_xml_answer(text: str) -> str:
    answer = text.split("<cevap>")[-1]
    answer = answer.split("</cevap>")[0]
    return answer.strip()

def correctness_reward_func(prompts, completions, answer, **kwargs) -> list[float]:
    responses = [completion[0]['content'] for completion in completions]
    q = prompts[0][-1]['content']
    extracted_responses = [extract_xml_answer(r) for r in responses]
    print('-'*20, f"Question:\n{q}", f"\nAnswer:\n{answer[0]}", f"\nResponse:\n{responses[0]}", f"\nExtracted:\n{extracted_responses[0]}")
    return [2.0 if r == a else 0.0 for r, a in zip(extracted_responses, answer)]
```

To check the correctness of the answer, I simply extract the text between the <cevap> and </cevap> XML tags and compare it with the correct answer. At this stage, my correct answers contain only digits, commas, and dots. As I noted before, at this point my correct answers contain only digits, commas and dots in them.

### Training Configuration

Below are some of the configurations I used during training. Since this was my first time using both Unsloth and GRPO, I kept some of the values as they were in the example notebook. I actually had different values for some of them in my mind but I didn't want to take any risks and wanted to do a training as simple as I could do.

|configuration|value|
|-------------|-----|
|LoRA Rank|32|
|LoRA Alpha|32|
|LoRA Target Modules|"q_proj", "k_proj", "v_proj",<br> "o_proj", "gate_proj", <br>"up_proj", "down_proj"|
|Max. Completion Length|1024|
|bf16|True|
|Per Device Train Batch Size|1|
|Gradient Accumulation Steps|1|
|Num Epochs|3|
|Number of Generations|6|
|Use vLLM for Generations|True|

### Training Process

Below plots are created using the rewards and the lengths of the completions generated during the training:

@[html](assets/plots/html_files/training_run_metrics.html, image=assets/plots/static_images/training_run_metrics.png)

The most noticeable change is in the "Format Reward By Step" plot, as the model quickly adapted to the new template. However, both the completion length and correctness reward did not show significant changes throughout training.

There could be several reasons for this:

- My dataset was very small.
- The dataset contained hard problems, some requiring floating-point operations to arrive at the correct answer.
- My hyperparameters were not ideal.

However since we are just **playing** with the GRPO, it is okay to do some things messy and unoptimized I think 😁

Training took exactly **6 hours** on [RunPod](https://www.runpod.io/) to complete using a single L40S (48GB).

## Results

After the training I merged the LoRA adapter with the base model and uploaded it to the huggingface.
You can access it [here](https://huggingface.co/Metin/LLaMA-3-8B-GRPO-Finance-Math-TR)

### Model Accuracy Comparison

Lets first look into the accuracy of the base model (Turkish-LLama-8b-DPO-v0.1) and the model I trained (LLaMA-3-8B-GRPO-Finance-Math-TR):

@[html](assets/plots/html_files/grpo_vs_base.html, image=assets/plots/static_images/grpo_vs_base.png)

It seems that even though that we didn't see a significant change in the positive correctness rewards during the training, the model appears to have learned a few things about financial math I guess.

I evaluated results across various temperature values because I noticed that for some temperatures, the model consistently performed either better or worse. To get a more comprehensive view, I decided to plot them all :D

### Gemma vs. LLaMA

After seeing these results, I wondered  about how the **original Gemma model** (gemma-2-9b-it) and my preference-finetuned Gemma model (Gemma-2-9b-it-TR-DPO-V1) would perform on the same test dataset:

@[html](assets/plots/html_files/gemma_vs_dpo.html, image=assets/plots/static_images/gemma_vs_dpo.png)

Interestingly, my Gemma-finetuned model performed slightly better than the original Gemma model. Both outperformed the base LLaMA model and the GRPO-trained LLaMA version. This was actually relieving to see because I wasn’t entirely sure if my Gemma-finetuned model was truly better than its base version. Seeing this improvement somewhat confirmed that it was indeed learning something :')

### Comparing All Models
Now, let’s compare all the models together:

@[html](assets/plots/html_files/all_models.html, image=assets/plots/static_images/all_models.png)

It seems that the GRPO training made the LLaMA model closer to the original Gemma model. Considering that:
- The dataset contained very difficult math problems,
- The dataset was small

...I think it’s nice to see even this level of improvement.

### What if?

I then wondered what the results would look like if we considered a solution correct as long as it was answered correctly at least once across all temperature values:

@[html](assets/plots/html_files/all_models_squashed.html, image=assets/plots/static_images/all_models_squashed.png)

As expected, scores increased from the **10–30 range** to the **25–30 range**.
This makes sense because we kinda simulated **sampling multiple generations** per question, which allows the models more chances to generate the correct answer.

At this point I had a **"wait a minute"** moment and wondered whether the models stick to the fact that in Turkish:
- Comma (,) is used as the **decimal separator**
- Dot (.) is used as the **thousands separator**

![Wait a Minute](/assets/peter_griffin_wait_a_minute.jpg|width=200)

To test this, I modified my preprocessing functions so that they would remove all punctuation from the numbers. This resulted in:

@[html](assets/plots/html_files/all_models_squashed_no_punctuation.html, image=assets/plots/static_images/all_models_squashed_no_punctuation.png)

As I suspected, some models incorrectly used the dot as the decimal separator and the comma as the thousands separator.
However, we cannot take these scores seriously, as the correct format should be learned by the models.

### Heatmap Analysis

Finally, I wanted to visualize the correctness of each model’s answers using heatmaps.
I arranged the 100 test questions in a 10×10 grid, coloring:
- Green for correct answers
- Black for incorrect answers

As before, a question is considered correct if it was answered correctly at any temperature.

@[html](assets/plots/html_files/model_comparison_heatmap.html, image=assets/plots/static_images/model_comparison_heatmap.png)

As expected, all models tended to answer the same questions correctly or incorrectly.

Now lets put those heatmaps on top of each other to see how they differ and how the models performed in overall:

@[html](assets/plots/html_files/combined_model_comparison_heatmap.html, image=assets/plots/static_images/combined_model_comparison_heatmap.png)

This tells us that if we consider the answer correct if it is answered correctly at any temperature value and if we look at the answers from all models, overall accuracy is 40% for the questions in the test dataset.

I think we could also reach this score by simply generating lots and lots of completions for each question and selecting the most common answer as the correct one (Majority Voting).

### Example Outputs

Before ending this post I also want to share some example answers generated by both the trained and the base model for the same questions.

Here is a question where the trained model answered correctly but the base model didn't:
![Example Question 1](assets/grpo-training/example_question1.png)

We see that the trained model choose to solve the question in a more manual way and the base model tried to use a formula to solve it. Since large language models are not good at math operations I guess manual way worked better in this case.

Here is a question where the base model answered correctly but the trained model didn't:
![Example Question 2](assets/grpo-training/example_question2.png)

Here we see that the trained model also found the solution at some point but reapplied an operation twice and got the wrong answer. The base model on the other hand found the correct answer in the first try.

## Final Thoughts

I think GRPO is a great approach for training a model, as it eliminates the need to generate responses for each question beforehand. I just collected some questions from the web and trained the model on them, using reward functions.

However, even in the math domain, which is typically considered easier for designing correctness reward functions, it is still hard to get a good result without a high quality dataset. During manual labeling of the dataset, I saw that even some of the answers were mixing the dot and the comma in the numbers. Small but important details like this can easily make the training process go sideways I think.

At the end I am glad that I got my hands dirty with the GRPO and I will definitely try it again in the future.

I hope this post is useful for those who want to do some experiments with the GRPO. If you have any questions or suggestions feel free to reach out :)

---

*Last updated: February 23, 2025*
