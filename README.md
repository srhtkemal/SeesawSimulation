Hello, I'm Serhat Kemal. Today I will show you the seesaw simulation I have made. Our application aims to set up a seesaw simulation without using any frameworks or libraries.
We have a few functions inside our application. These are stopping, resuming, undoing, being able to continue from where we left off when we refresh the page, and being able to reset the entire seesaw.

Seesaw plank is defined as fixed length.
The pivot is located exactly in the middle of the seesaw plank.
When a user selects an area of the seesaw, they can place any weight they want. Placed weights change color according to their weight. We use the following code snippet for this.
![alt text](image.png)

The seesaw tilts according to the torque changes, with a maximum of 30 degrees based on the applied torque. This is a linear tilt. Therefore, when there is a double torque difference, it tilts with a double angle. The latest stage is stored with local storage, and when the page is reloaded, it continues from where it left off.
------
There are sound effects running within the application. In the stop-continue functions click.wav, when the seesaw moves creak.wav, and when a new weight is placed drop.wav sounds are played. In the version I set up, the click.wav sound is the click sound in Minecraft, the creak.wav sound is the Minecraft door creaking sound. The drop.wav sound is the Minecraft soil placement sound.
 [[I used the sample sounds from this link](https://drive.google.com/drive/folders/1ckqD8UuzrznO0f7IHUhJ6BpufdH2OoLL?usp=drive_link)] kullandım. 



---
My alternative approach. 

I have explained the features that the project has. But I also wanted to add something of my own to the project. Now I will explain what I want to add.
In our project, the seesaw tilts up to a certain angle according to the amount of weight, but this is not how it works in real life. If you put 1 kg more on one side, the heavier side will not stop until it touches the ground, even if it is slow.

![Original Code](image-7.png)
![Alternative Code](image-8.png)
In my alternative method, if one side is heavier than the other, the seesaw moves until it touches the ground.
My second approach is as follows.

Let's consider the moment the seesaw touches the ground.
![alt text](image-2.png)
There is still torque on the seesaw. But this torque is no longer the weight * arm_length we used in the code. In this case, we can use the Torque formula.
![alt text](image-3.png)

When we rearrange the formula, we see that the theta value for us is 90−(currentAngle).
So, instead of using sin(90-currentAngle) in the formula,
![alt text](<Ekran görüntüsü 2026-04-15 190903.png>)
So we can use cos(currentAngle). Because it will give us the same result.
![alt text](image-4.png)
We can define it in the code like this. 
![Original Code](image-5.png)
![Alternative Code](image-6.png)

This way, we have obtained a seesaw that is more suitable for the laws of physics. As the seesaw approaches the center, its torque increases, and as it moves away, its torque decreases.
![alt text](image-9.png)
![alt text](image-10.png)
![alt text](image-11.png)
If we place a weight of the same size on the opposite side, it will balance out because the torques are equal to each other. In other words, since no rotational force remains, the seesaw will return to its initial state.
![alt text](image-12.png)
![alt text](image-13.png)
![alt text](image-14.png)
These alternative methods I mentioned will be available within the code as comment lines. When you replace the "original code" parts with the "alternative code," the application will work with the alternative approach.

Thank you for your time and for reviewing; you can reach out if you have any further questions. 
Hope to see you soon.
Serhat Kemal 