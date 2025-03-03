#!/usr/bin/env bash

if [ -f /etc/arch-release ]; then
  ANSIBLE_PYTHON_INTERPRETER=auto_silent \
  ANSIBLE_CONFIG="$HOME/code/rhythm.place/ansible/ansible.cfg" \
  ansible-playbook -e "ansible_port=2200" "${HOME}/code/rhythm.place/ansible/production.yml" --ask-vault-pass -i tyche,
else
  ANSIBLE_PYTHON_INTERPRETER=auto_silent \
  ANSIBLE_CONFIG=/var/www/rhythm.place/ansible/ansible.cfg \
  ansible-playbook --connection=local -e "ansible_port=2200" /var/www/rhythm.place/ansible/development.yml -i localhost,
fi