Vagrant.configure("2") do |config|
  
  config.vm.box = "hashicorp/precise32"
  config.vm.network "forwarded_port", guest: 80, host: 5090, auto_correct: true
  config.vm.network "forwarded_port", guest: 3306, host: 5095, auto_correct: true

  #config.ssh.password = "sbb_dev"
  #config.ssh.private_key_path = "C:/Users/Cameron/.ssh/id_rsa"

  config.vm.provision "shell" do |s|
    s.path = "provision/setup.sh"
  end

end
