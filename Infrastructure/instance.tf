resource "aws_instance" "web" {
  ami                    = var.image_id
  instance_type          = var.instance_type
  key_name               = aws_key_pair.key-tf.key_name
  vpc_security_group_ids = ["${aws_security_group.all_tls.id}"]
  tags = {
    Name = "Cost-Optimized-App-Server"
  }
  
}
output "instance_ip" {
  value = aws_instance.web.public_ip
}
  
